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
            You can change the <span className="tip-word">sorting</span> to &quot;progress&quot; to show the students
            who have completed the fewest challenges, or by &quot;struggling&quot; to show those students who have been
            having trouble with recent activities.
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
