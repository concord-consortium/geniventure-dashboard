import migrate from './migrations';

// pseudo random generator. won't be needed when we have data
const randCache = {};
const pseudoRandom = (string) => {
  const seed = string;
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const migrateAllData = (data) => {
  const studentData = Object.assign({}, data);
  Object.keys(studentData).forEach(studentId => {
    studentData[studentId].state = migrate(studentData[studentId].state);
  });
  return studentData;
};

class StudentDataStore {
  constructor(authoring, fbStudentData, time, sortActive) {
    this.authoring = authoring;
    this.fbStudentData = migrateAllData(fbStudentData);
    this.studentIds = Object.keys(this.fbStudentData);
    this.sortActive = sortActive;
    this.time = time;
    this.idleLevels = {
      HERE: "here",
      IDLE: "idle",
      GONE: "gone",
      NEVER: "never"
    };

    // create the data object
    this.createDataMap();

    // sort
    this.sortStudentIds();
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
      const studentA = this.data[a].name;
      const studentB = this.data[b].name;
      const nameA = studentA.name.toUpperCase();
      const nameB = studentB.name.toUpperCase();
      const isActiveA = studentA.idleLevel !== this.idleLevels.NEVER;
      const isActiveB = studentB.idleLevel !== this.idleLevels.NEVER;
      if (this.sortActive && isActiveA && !isActiveB) {
        return -1;
      }
      if (this.sortActive && !isActiveA && isActiveB) {
        return 1;
      }
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }

  createDataMap() {
    this.data = {};

    this.studentIds.forEach((id) => {
      const studentData = {};
      const student = this.fbStudentData[id];

      let timeSinceLastAction;
      let idleLevel = this.idleLevels.NEVER;

      if (student.stateMeta && student.stateMeta.lastActionTime) {
        const lastActionTime = student.stateMeta.lastActionTime;
        timeSinceLastAction = (this.time - lastActionTime) / 1000;
        if (timeSinceLastAction < 300) {
          idleLevel = this.idleLevels.HERE;
        } else if (timeSinceLastAction < 3600) {
          idleLevel = this.idleLevels.IDLE;
        } else {
          idleLevel = this.idleLevels.GONE;
        }
      }
      studentData.name = {
        name: student.name,
        timeSinceLastAction,
        idleLevel
      };

      const gems = student.state && student.state.gems ? student.state.gems : [];
      const loc = student.stateMeta ? student.stateMeta.currentChallenge : null;

      this.authoring.levels.forEach((level, i) => {
        level.missions.forEach((mission, j) => {
          mission.challenges.forEach((challenge, k) => {
            const key = JSON.stringify({level: i, mission: j, challenge: k});
            const score = gems[i] && gems[i][j] && gems[i][j][k] ? gems[i][j][k] : [];
            const isHere = idleLevel !== this.idleLevels.GONE
                            && loc && loc.level === i && loc.mission === j
                            && loc.challenge === k;

            studentData[key] = {
              score,
              isHere
            };
          });
        });
      });

      studentData.concepts = [];
      if (student.itsData) {
        if (student.itsData.conceptsAggregated) {
          studentData.concepts = student.itsData.conceptsAggregated.map(d => ({
            label: d.conceptId,
            value: d.score
          }));
        }
      }

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
        if (conceptsMap[c.label] === undefined) {
          conceptsMap[c.label] = {count: 0, total: 0};
        }
        conceptsMap[c.label].count += 1;
        conceptsMap[c.label].total += c.value;
      });
    });
    Object.keys(conceptsMap).forEach(label => {
      const concept = conceptsMap[label];
      allStudentData.concepts.push({
        label,
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

    // temp
    if (colKey.indexOf("concept-") > -1) {
      if (!randCache[index + colKey]) {
        randCache[index + colKey] = pseudoRandom(index + parseInt(colKey.substr(8), 10));
      }
      return randCache[index + colKey];
    }

    const studentId = this.studentIds[index];
    return this.data[studentId][colKey];;
  }

  getSize() {
    return this.studentIds.length;
  }
}

module.exports = StudentDataStore;
