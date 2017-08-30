
class StudentDataStore {
  constructor(authoring, studentData) {
    this.authoring = authoring;
    this.studentData = studentData;
    this.studentIds = this.getAllStudentIds();
    this.size = this.studentIds.length;
    this.cache = {};
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
      const data = {name: student.name};
      if (student.stateMeta && student.stateMeta.lastActionTime) {
        data.lastActionTime = student.stateMeta.lastActionTime;
      }
      return data;
    }
    if (!student.state && !student.stateMeta) {
      return "";
    }
    if (colKey.indexOf("concept") > -1) {
      return Math.random();
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
