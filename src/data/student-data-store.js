import migrate from './migrations';
import { parseFullName } from 'parse-full-name';

export const Sorting = {
  FIRST_NAME: "first-name",
  LAST_NAME: "last-name",
  OVERALL_PROGRESS: "overall-progress",
  RECENT_PERFORMANCE: "recent-performance",

  ASCENDING: "ascending",
  DESCENDING: "descending"
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
    short: "Sex Determ.",
    description: "Females have two X chromosomes. Males have one X and one Y.",
    trait: "",
    location: ""
  },
  "LG1.C2a": {
    long: "Simple Dominance",
    longer: "Simple Dominance",
    short: "Simple Dom.",
    description: "Only one dominant allele is needed to produce the dominant trait.",
    trait: "",
    location: ""
  },
  "LG1.C2b": {
    long: "Recessive",
    longer: "Recessive Traits",
    short: "Recessive",
    description: "Two recessive alleles are needed to produce a recessive trait.",
    trait: "For most traits, the absence is recessive. Horns is surprising as the presence of horns is recessive. If students are having trouble with this concept, it may be due to a misunderstanding of the Horns trait.",
    location: "Horns are introduced in Mission 2.2"
  },
  "LG1.C3": {
    long: "Incomplete Dom.",
    longer: "Incomplete Dominance",
    short: "Incomp. Dom.",
    description: "For some traits, both alleles will have some effect, with neither being completely dominant.",
    trait: "Armor plates are an example of incomplete dominance.",
    location: "Armor is introduced in Mission 2.2."
  },
  "LG1.P1": {
    long: "Geno-to-Pheno Mapp.",
    longer: "Geno-to-Pheno Mapping",
    short: "Geno to Pheno",
    description: "Given a genotype predict the phenotype of an organism.",
    trait: "",
    location: "This concept is evaluated in all the egg sorting games (like Mission 2.1)."
  },
  "LG1.P2": {
    long: "Pheno-to-Geno Mapp.",
    longer: "Pheno-to-Geno Mapping",
    short: "Pheno to Geno",
    description: "Given a phenotype, determine possible genotypes of an organism.",
    trait: "",
    location: "This concept is evaluated in all the drake match challenges (like Mission 1.2 and 2.2)."
  },
  "LG1.C4a": {
    long: "Epistasis",
    longer: "Epistasis",
    short: "Epistasis",
    description: "A gene can mask the effect of other genes",
    trait: "Albinism is an example of an epistatic trait. If the drake is albino, no other color genes take effect.",
    location: "This trait is introduced in Mission 3.1."
  },
  "LG2.P1": {
    long: "Gamete Selection",
    longer: "Gamete Selection",
    short: "Gamete Selection",
    description: "Create or select parental gametes to create an individual offspring with a specific phenotype.",
    trait: "",
    location: "This concept is evaluated in all the meiosis challenges of Mission 4.1."
  },
  "LG3.P1": {
    long: "Parent Genotypes",
    longer: "Parent Genotypes",
    short: "Parent Geno.",
    description: "Set or select parental genotypes to produce a specific pattern of traits in offspring.",
    trait: "",
    location: "This concept is evaluated in the basic breeding challenges (Missions 4.2 and 4.3)."
  },
  "LG3.P3": {
    long: "Patterns in Offspring",
    longer: "Patterns in Offspring",
    short: "Offspring Patterns",
    description: "Use patterns in the phenotypes of a group of offspring to predict the genotype of the parents.",
    trait: "",
    location: "This concept is evaluated in the advanced breeding challenges, which are sibling pairs (Mission 4.3) and test cross (Mission 5.1)."
  },
  "LG3.P4": {
    long: "Test Cross",
    longer: "Test Cross",
    short: "Test Cross",
    description: "Breed with a recessive animal to determine an unknown genotype.",
    trait: "",
    location: "This concept is evaluated in Mission 5.1.3, the final test-cross challenge."
  },
  "LG1.C2d": {
    long: "Polyallelic",
    longer: "Polyallelic Traits",
    short: "Polyallelic",
    description: "Some traits have multiple alleles, which can form a ranked series in terms of dominance.",
    trait: "Tails are an example of a pollyallelic trait. Long tail is dominant to kinked tail and kinked tail is dominant to short tail.",
    location: "This concept is evaluated in the challenges in Level 6."
  },
  "LG1.C2c": {
    long: "X Linked",
    longer: "X Linked Traits",
    short: "X Linked",
    description: "Genes on the X chromosome are referred to as X-linked. Males receive only one copy of the X chromosome, and pass on their X only to their daughters.",
    trait: "Nose spikes and deep color are examples of a X linked traits",
    location: "This concept is evaluated in the challenges in Level 6."
  }
};

const getConceptLabel = (code) => {
  const label = conceptLabels[code];
  return label || {long: code, short: code};
};

export class StudentDataStore {
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
      sort: Sorting.LAST_NAME
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

  update(authoring, rawFBStudentData, time, sortActive, sort, ascending) {
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
      this.sortStudentIds(sort, ascending);

      if (this.sortActive) {
        this.calculateActivityCategoryRows();
      }

      this.lastUpdateTime = Date.now();
    }
  }

  // returns an array of ids, sorted by student name
  sortStudentIds(sort, ascending) {
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

      const parseName = (name) => {
        const { first, last, suffix } = parseFullName(name);
        // parseFullName treats "2" as a suffix, like "II" or "Jr."
        return (suffix === "2")
                ? { first: last, last: suffix }
                : { first, last };
      };

      const getValuesForSorting = (student) => {
        const { name, progress, recentScore } = student;
        const { first, last } = parseName(name.name);
        const firstValue = first && isFinite(Number(first)) ? Number(first) : first;
        const lastValue = last && isFinite(Number(last)) ? Number(last) : last;

        switch (sort) {
          case Sorting.OVERALL_PROGRESS:
            return [progress, recentScore, lastValue, firstValue];
          case Sorting.RECENT_PERFORMANCE:
            return [recentScore, progress, lastValue, firstValue];
          case Sorting.FIRST_NAME:
            return [firstValue, lastValue, progress, recentScore];
          case Sorting.LAST_NAME:
          default:
            return [lastValue, firstValue, progress, recentScore];
        }
      };

      const valueComparator = (v1, v2) => {
        if ((typeof v1 === "number") && (typeof v2 === "number")) {
          return v1 - v2;
        }
        const v1Str = String(v1);
        const v2Str = String(v2);
        if (v1Str < v2Str) return -1;
        if (v2Str < v1Str) return 1;
        return 0;
      };

      const studentAValues = getValuesForSorting(studentA);
      const studentBValues = getValuesForSorting(studentB);
      const ascendingFactor = ascending === Sorting.ASCENDING ? 1 : -1;

      for (let i = 0; i < studentAValues.length; ++i) {
        const compareValue = valueComparator(studentAValues[i], studentBValues[i]);
        if (compareValue) return compareValue * ascendingFactor;
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
      const remediationHistory = student.state && student.state.remediationHistory ? student.state.remediationHistory : [];

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
            const hadRemediation = remediationHistory[i] && remediationHistory[i][j] &&
                    remediationHistory[i][j][k] ?
                    remediationHistory[i][j][k] :
                    [];

            studentData[key] = {
              score,
              hadRemediation,
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

      studentData.recentScore = calculateRecentScore(completedChallenges, lastThreeScores);

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
        } else if (student.itsData && student.itsData.studentModel
            && student.itsData.studentModel.concepts
            && (data = student.itsData.studentModel.concepts.find(d => c.id === d.conceptId))) {
          return {
            code: c.id,
            label: getConceptLabel(c.id),
            value: data.probabilityLearned
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

    // clone concept data into new array so we can freely sort it
    const conceptData = [];
    this.studentIds.forEach((id) => {
      conceptData.push(Object.assign({}, this.data[id].concepts));
    });

    const concepts = this.data[this.studentIds[0]].concepts;
    for (let i = 0; i < concepts.length; i++) {
      const sortedConcepts = conceptData
        .filter(c => c[i].value >= 0)
        .sort((a, b) => a[i].value - b[i].value);
      let median = -1;
      if (sortedConcepts.length) {
        median = sortedConcepts[Math.floor((sortedConcepts.length - 1) / 2)][i].value;
      }
      allStudentData.concepts.push(Object.assign({}, concepts[i], {value: median}));
    }

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
  concepts.push({id, long: conceptLabels[id].long, longer: conceptLabels[id].longer, description: conceptLabels[id].description, trait: conceptLabels[id].trait, location: conceptLabels[id].location});
});

StudentDataStore.concepts = concepts;
