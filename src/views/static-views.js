import React from 'react';
import { StudentDataStore } from '../data/student-data-store';

const renderConceptKey = () =>
  (
    <div>
      <h2>Concept key:</h2>
      <dl>
        {
          StudentDataStore.concepts.map(concept =>
            [
              <dt>{concept.long}</dt>,
              <dd>{concept.description}</dd>
            ]
          )
        }
      </dl>
    </div>
  );

const renderHelp = (toggleHelp) =>
  (
    <div id="help-modal" className="modal">
      <h1>Help</h1>
      <div>
        <ul>
          <li>
            Click on the <span className="tip-word">drawer handle</span> at the top of the chart to view sorting options.
          </li>
          <li>
            Click on a <span className="tip-word">column heading</span> to show a detailed
            report and information for that challenge.
          </li>
          <li>
            Click on the <span className="tip-word">toggle</span> next to a student name to
            show a detailed report for that student
            for that challenge.
          </li>
        </ul>
      </div>
      { renderConceptKey() }
      <button id="close-help" className="button-on-white" onClick={toggleHelp}>Close</button>
    </div>
  );

module.exports = {
  renderConceptKey,
  renderHelp
};
