import migrate from './migrations';

const migrateAllData = (data) => {
  const studentData = Object.assign({}, data);
  Object.keys(studentData).forEach(studentId => {
    studentData[studentId].state = migrate(studentData[studentId].state);
  });
  return studentData;
};

class StudentDataStore {
  constructor(authoring, studentData, time) {
    this.authoring = authoring;
    this.studentData = migrateAllData(studentData);
    this.studentIds = this.getAllStudentIds();
    this.size = this.studentIds.length;
    this.time = time;
    this.cache = {};
    this.idleLevels = {
      HERE: "here",
      IDLE: "idle",
      GONE: "gone"
    };

    // won't be needed when we have data
    this.seed = 1;
    this.pseudoRandom = () => {
      this.seed += 1;
      const x = Math.sin(this.seed) * 10000;
      return x - Math.floor(x);
    };
  }

  // returns an array of ids, sorted by student name
  getAllStudentIds() {
    const data = [];
    Object.keys(this.studentData).forEach(studentId => {
      const student = this.studentData[studentId];
      data.push({
        id: studentId,
        name: student.name
      });
    });
    data.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    return data.map((s) => s.id);
  }

  createRowObjectData(studentId, colKey) {
    const student = this.studentData[studentId];
    if (colKey === "name") {
      const name = student.name;
      let timeSinceLastAction;
      let idleLevel = this.idleLevels.GONE;

      if (student.stateMeta && student.stateMeta.lastActionTime) {
        const lastActionTime = student.stateMeta.lastActionTime;
        timeSinceLastAction = (this.time / 1000) - lastActionTime;
        if (timeSinceLastAction < 300) {
          idleLevel = this.idleLevels.HERE;
        } else if (timeSinceLastAction < 3600) {
          idleLevel = this.idleLevels.IDLE;
        }
      }
      return {
        name,
        timeSinceLastAction,
        idleLevel
      };
    }
    if (!student.state && !student.stateMeta) {
      return "";
    }
    if (colKey.indexOf("concept") > -1) {
      return this.pseudoRandom();
    }
    const {level, mission, challenge} = JSON.parse(colKey);
    const gems = student.state ? student.state.gems : null;
    const loc = student.stateMeta ? student.stateMeta.currentChallenge : null;
    const isHere = loc && loc.level === level
            && loc.mission === mission && loc.challenge === challenge;

    if (gems && gems[level] && gems[level][mission]
        && gems[level][mission][challenge] != null) {
      return {
        score: gems[level][mission][challenge],
        isHere
      };
    }
    return {
      score: [],
      isHere
    };
  }

  getObjectAt(index, colKey) {
    if (index < 0 || index > this.size) {
      return undefined;
    }
    const studentId = this.studentIds[index];
    if (this.cache[studentId] === undefined || this.cache[studentId][colKey] === undefined) {
      this.cache[studentId] = this.cache[studentId] || {};
      this.cache[studentId][colKey] = this.createRowObjectData(studentId, colKey);
    }
    return this.cache[studentId][colKey];
  }

  getSize() {
    return this.size;
  }
}

module.exports = StudentDataStore;
