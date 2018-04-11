import migrate from './migrations';

const Sorting = {
  ALPHABETICAL: "alphabetical",
  PROGRESS: "progress",
  STRUGGLING: "struggling"
};

const migrateAllData = (data) => {
  const studentData = Object.assign({}, data);
  Object.keys(studentData).forEach(studentId => {
    studentData[studentId].state = migrate(studentData[studentId].state);
  });
  return studentData;
};

let totalChallenges = 0;

// returns a score based on how well the student is doing at the moment
const calculateRecentScore = (completedChallenges, lastThreeScores) => {
  const percComplete = completedChallenges / totalChallenges;
  const totalScore = lastThreeScores.reduce((a, b) => a + b, 0);
  const positiveScore = (4 * 3) - totalScore;   // Three 4s is the worst score
  const percScore = positiveScore / (4 * 3);

  // weight recent scores most, and settle differences by completion
  return (percComplete * 0.05) + (percScore * 0.95);
};

const activitySortOrder = {
  idle: 0,
  here: 1,
  gone: 2,
  never: 3
};

const conceptLabels = {
  "LG1.A3": {
    long: "Sex Determination",
    longer: "Sex Determination",
    short: "Sex Det.",
    description: "Females have two X chromosomes. Males have one X and one Y."
  },
  "LG1.C2a": {
    long: "Simple Dominance",
    longer: "Simple Dominance",
    short: "Simple Dom.",
    description: "Only one dominant allele is needed to produce the dominant trait. "
  },
  "LG1.C2b": {
    long: "Recessive",
    longer: "Recessive Traits",
    short: "Reces.",
    description: "Two recessive alleles are needed to produce a recessive trait."
  },
  "LG1.C3": {
    long: "Incomplete Dom.",
    longer: "Incomplete Dominance",
    short: "Inc. Dom.",
    description: "For some traits, both alleles will have some effect, with neither being completely dominant."
  },
  "LG1.P1": {
    long: "Geno-to-Pheno Mapp.",
    longer: "Geno-to-Pheno Mapping",
    short: "Geno - Pheno",
    description: "Given a genotype predict the phenotype of an organism. "
  },
  "LG1.P2": {
    long: "Pheno-to-Geno Mapp.",
    longer: "Pheno-to-Geno Mapping",
    short: "Pheno - Geno",
    description: "Given a phenotype, determine possible genotypes of an organism."
  },
  "LG1.C4a": {
    long: "Epistasis",
    longer: "Epistasis",
    short: "Epistasis",
    description: "A gene can mask the effect of other genes"
  },
  "LG2.P1": {
    long: "Gamete selection",
    longer: "Gamete selection",
    short: "Gamete sel.",
    description: "Create or select parental gametes to create an individual offspring with a specific phenotype."
  },
  "LG3.P2": {
    long: "Parent genotypes",
    longer: "Parent genotypes",
    short: "Parent gene",
    description: "Set parental genotypes to produce a specific pattern of offspring."
  }
};

const getConceptLabel = (code) => {
  const label = conceptLabels[code];
  return label || {long: code, short: code};
};

class StudentDataStore {
  constructor() {
    this.activityLevels = {
      HERE: "here",
      IDLE: "idle",
      GONE: "gone",
      NEVER: "never"
    };
    this.activityRows = {
      idle: -1,
      here: -1,
      gone: -1,
      never: -1
    };
    this.cache = {
      authoring: "",
      fbStudentData: "",
      time: 0,
      sortActive: false,
      sort: Sorting.ALPHABETICAL
    };
    // simple property we can use to force rerender (hack, because we keep using same
    // datastore object, so React doesn't know to re-render columns)
    this.lastUpdateTime = Date.now();
  }

  // Compare the new data we have with out cache, and return `true` if we need
  // to update.
  checkCache(authoring, rawFBStudentData, time, sortActive, sort) {
    const authoringStr = JSON.stringify(authoring);
    const rawFBStudentDataStr = JSON.stringify(rawFBStudentData);

    if (time !== this.cache.time || sortActive !== this.cache.sortActive
        || sort !== this.cache.sort
        || authoringStr !== this.cache.authoring
        || rawFBStudentData !== this.cache.rawFBStudentData) {
      // update cache
      this.cache = {
        authoring: authoringStr,
        rawFBStudentData: rawFBStudentDataStr,
        time,
        sortActive,
        sort
      };
      return true;
    }
    return false;
  }

  update(authoring, rawFBStudentData, time, sortActive, sort) {
    const shouldUpdate = this.checkCache(authoring, rawFBStudentData, time, sortActive, sort);
    if (shouldUpdate) {
      this.authoring = authoring;
      this.fbStudentData = migrateAllData(rawFBStudentData);
      this.studentIds = Object.keys(this.fbStudentData);
      this.sortActive = sortActive;
      this.sort = sort;
      this.time = time;

      // create the data object
      this.createDataMap();

      // sort
      this.sortStudentIds();

      if (this.sortActive) {
        this.calculateActivityCategoryRows();
      }

      this.lastUpdateTime = Date.now();
    }
  }

  // returns an array of ids, sorted by student name
  sortStudentIds() {
    this.studentIds.sort((a, b) => {
      if (a === "all-students") {
        return -1;
      }
      if (b === "all-students") {
        return 1;
      }
      const studentA = this.data[a];
      const studentB = this.data[b];

      // if two students are in different activity categories, sort if requested
      if (this.sortActive) {
        const activityScoreA = activitySortOrder[studentA.name.activityLevel];
        const activityScoreB = activitySortOrder[studentB.name.activityLevel];
        if (activityScoreA !== activityScoreB) {
          return activityScoreA - activityScoreB;
        }
      }

      // if they have different progresses, sort if requested
      if (this.sort === Sorting.PROGRESS) {
        const scoreA = this.data[a].progress;
        const scoreB = this.data[b].progress;

        if (scoreA < scoreB) {
          return -1;
        }
        if (scoreA > scoreB) {
          return 1;
        }
      }

      // if they have different scores, sort if requested, or if we are sorting by progress and are tied
      if (this.sort === Sorting.STRUGGLING || this.sort === Sorting.PROGRESS) {
        const scoreA = this.data[a].recentScore;
        const scoreB = this.data[b].recentScore;

        if (scoreA < scoreB) {
          return -1;
        }
        if (scoreA > scoreB) {
          return 1;
        }
      }

      // sort alphabetically last
      const nameA = studentA.name.name.toUpperCase();
      const nameB = studentB.name.name.toUpperCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }

  // Requires studentIds to have already been sorted by activity
  calculateActivityCategoryRows() {
    this.activityRows = {
      idle: -1,
      here: -1,
      gone: -1,
      never: -1
    };
    this.studentIds.forEach((s, i) => {
      const activityLevel = this.data[s].name.activityLevel;
      if (this.activityRows[activityLevel] === -1) {
        this.activityRows[activityLevel] = i - 1;   // -1 die to all-students row
      }
    });
  }

  createDataMap() {
    this.data = {};

    this.studentIds.forEach((id) => {
      const studentData = {};
      const student = this.fbStudentData[id];

      let timeSinceLastAction;
      let activityLevel = this.activityLevels.NEVER;

      if (student.stateMeta && student.stateMeta.lastActionTime) {
        const lastActionTime = student.stateMeta.lastActionTime;
        timeSinceLastAction = (this.time - lastActionTime) / 1000;
        if (timeSinceLastAction < 300) {
          activityLevel = this.activityLevels.HERE;
        } else if (timeSinceLastAction < 3600) {
          activityLevel = this.activityLevels.IDLE;
        } else {
          activityLevel = this.activityLevels.GONE;
        }
      }
      studentData.name = {
        name: student.name,
        timeSinceLastAction,
        activityLevel
      };

      const gems = student.state && student.state.gems ? student.state.gems : [];
      const loc = student.stateMeta ? student.stateMeta.currentChallenge : null;

      let completedChallenges = 0;
      // If student has fewer than three gems, pretend previous were blue
      const lastThreeScores = [0, 0, 0];
      totalChallenges = 0;

      this.authoring.levels.forEach((level, i) => {
        level.missions.forEach((mission, j) => {
          mission.challenges.forEach((challenge, k) => {
            const key = JSON.stringify({level: i, mission: j, challenge: k});
            const score = gems[i] && gems[i][j] && gems[i][j][k] ? gems[i][j][k] : [];
            const isHere = activityLevel !== this.activityLevels.GONE
                            && loc && loc.level === i && loc.mission === j
                            && loc.challenge === k;

            studentData[key] = {
              score,
              isHere
            };

            totalChallenges += 1;
            if (score.length) {
              completedChallenges += 1;
              // push the most recent array of scores into lastThreeScores, keeping
              // length at max 3
              lastThreeScores.push(...score);
              lastThreeScores.splice(0, lastThreeScores.length - 3);
            }
          });
        });
      });

      studentData.progress = completedChallenges;

      if (this.sort === Sorting.STRUGGLING || this.sort === Sorting.PROGRESS) {
        studentData.recentScore = calculateRecentScore(completedChallenges, lastThreeScores);
      }


      studentData.concepts = StudentDataStore.concepts.map(c => {
        let data;
        if (student.itsData && student.itsData.studentModel
            && student.itsData.studentModel.conceptsAggregated
            && (data = student.itsData.studentModel.conceptsAggregated.find(d => c.id === d.conceptId))) {
          return {
            code: c.id,
            label: getConceptLabel(c.id),
            value: data.score
          };
        }
        return {
          code: c.id,
          label: getConceptLabel(c.id),
          value: -1
        };
      });

      this.data[id] = studentData;
    });

    this.addAllStudentsRow();
  }

  addAllStudentsRow() {
    if (!this.studentIds.length || !this.authoring.levels) {
      return;
    }
    const allStudentData = {};

    allStudentData.name = {
      name: "All students",
      allStudents: true
    };

    this.authoring.levels.forEach((level, i) => {
      level.missions.forEach((mission, j) => {
        mission.challenges.forEach((challenge, k) => {
          const key = JSON.stringify({level: i, mission: j, challenge: k});
          const scores = this.getScoreCounts(key);
          allStudentData[key] = scores;
        });
      });
    });

    allStudentData.concepts = [];
    const conceptsMap = {};
    this.studentIds.forEach((id) => {
      const studentConcepts = this.data[id].concepts;
      studentConcepts.forEach((c) => {
        if (conceptsMap[c.code] === undefined) {
          conceptsMap[c.code] = {count: 0, total: 0};
        }
        if (c.value !== -1) {
          conceptsMap[c.code].count += 1;
          conceptsMap[c.code].total += c.value;
        }
      });
    });
    Object.keys(conceptsMap).forEach(code => {
      const concept = conceptsMap[code];
      allStudentData.concepts.push({
        code,
        label: getConceptLabel(code),
        value: concept.total / concept.count
      });
    });

    const allStudentsId = "all-students";
    this.studentIds.unshift(allStudentsId);
    this.data[allStudentsId] = allStudentData;
  }

  getScoreCounts(colKey) {
    const counts = {
      studentCount: this.studentIds.length,
      0: 0,
      1: 0,
      2: 0,
      3: 0
    };
    this.studentIds.forEach((id) => {
      const scoreObj = this.data[id][colKey];
      if (scoreObj && scoreObj.score) {
        counts[scoreObj.score[scoreObj.score.length - 1]] += 1;
      }
    });
    return counts;
  }

  getObjectAt(index, colKey) {
    if (index < 0 || index > this.studentIds.length || !colKey) {
      return undefined;
    }

    const studentId = this.studentIds[index];
    return this.data[studentId][colKey];
  }

  getSize() {
    return this.studentIds.length;
  }

  getActivityHeadingForRow(i) {
    if (this.sortActive) {
      if (this.activityRows.idle === i) {
        return "idle";
      }
      if (this.activityRows.here === i) {
        return "online";
      }
      if (this.activityRows.gone === i) {
        return "offline";
      }
      if (this.activityRows.never === i) {
        return "never logged in";
      }
    }
    return false;
  }
}

const concepts = [];
Object.keys(conceptLabels).forEach(id => {
  concepts.push({id, long: conceptLabels[id].long, description: conceptLabels[id].description});
});

StudentDataStore.concepts = concepts;

module.exports = {
  StudentDataStore,
  Sorting
};
