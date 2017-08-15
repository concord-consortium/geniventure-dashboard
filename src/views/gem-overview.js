import React, { Component } from 'react';
import {Table, Column, ColumnGroup, Cell} from 'fixed-data-table';
import '../css/fixed-data-table.css';
import '../css/gem-table.css';

const TextCell = ({rowIndex, data, col, ...props}) => (
  <Cell {...props}>
    {data(rowIndex, col)}
  </Cell>
);

const GemCell = ({rowIndex, data, col, ...props}) => {
  const gemScore = data(rowIndex, col);
  if (gemScore === -1) {
    return <div />;
  }
  const imagePath = 'http://geniventure.concord.org/resources/fablevision/venture-pad/gem_';
  const gemNames = ["blue", "yellow", "red"];
  const url = `${imagePath}${gemNames[gemScore]}.png`;
  const style = url ?
      {backgroundImage: `url(${url})`} :
      undefined;
  return <div className="gem-image" style={style} />;
};

// http://geniventure.concord.org/resources/fablevision/venture-pad/gem_blue.png

const dataGetter = (studentData) => {
  const data = [];
  Object.keys(studentData).forEach(studentId => {
    const student = studentData[studentId];
    data.push({
      name: student.name,
      state: JSON.stringify(student.state)
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

  const getData = (rowIndex, col) => {
    if (col === "name") {
      return data[rowIndex].name;
    }
    if (!data[rowIndex].state) {
      return "";
    }
    const gems = JSON.parse(data[rowIndex].state).gems;
    if (gems && gems[col.level] && gems[col.level][col.mission] && gems[col.level][col.mission][col.challenge] != null) {
      return gems[col.level][col.mission][col.challenge];
    }
    return -1;
  };
  getData.dataLength = data.length;
  return getData;
};

const createChallengeColumns = (authoring, getData) => {
  if (!authoring.levels) {
    return null;
  }
  const columnGroups = [];
  columnGroups.push(
    <ColumnGroup
      fixed={true}
    >
      <Column
        header={<Cell>Name</Cell>}
        cell={<TextCell data={getData} col="name" />}
        fixed={true}
        width={100}
      />
    </ColumnGroup>
  );
  authoring.levels.forEach((level, i) => {
    level.missions.forEach((mission, j) => {
      const missionName = `Mission ${i + 1}.${j + 1}`;
      const columns = mission.challenges.map((challenge, k) =>
        <Column
          fixed={true}
          header={<Cell>{k + 1}</Cell>}
          cell={<GemCell data={getData} col={{level: i, mission: j, challenge: k}} />}
          width={45}
        />
      );
      columnGroups.push(
        <ColumnGroup
          header={<Cell>{missionName}</Cell>}
        >
          {columns}
        </ColumnGroup>
      );
    });
  });
  return columnGroups;
};

export default class GemOverview extends Component {
  render() {
    const {authoring, studentData} = this.props;
    const getData = dataGetter(studentData);
    const columns = createChallengeColumns(authoring, getData);
    return (
      <Table
        rowHeight={45}
        groupHeaderHeight={45}
        headerHeight={30}
        rowsCount={getData.dataLength}
        width={1320}
        height={500}
        {...this.props}
      >
        {columns}
      </Table>
    );
  }
}
