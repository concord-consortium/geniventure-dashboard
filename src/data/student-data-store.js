
class StudentDataStore {
  constructor(authoring, studentData){
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
      return student.name;
    }
    if (!student.state) {
      return "";
    }
    const colData = JSON.parse(colKey);
    const gems = student.state.gems;
    if (gems && gems[colData.level] && gems[colData.level][colData.mission]
        && gems[colData.level][colData.mission][colData.challenge] != null) {
      const gem = gems[colData.level][colData.mission][colData.challenge];
      if (!isNaN(gem)) {
        return gem;
      }
      return gem[gem.length - 1];
    }
    return -1;
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
