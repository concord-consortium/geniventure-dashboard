import React from 'react';
import { StudentDataStore } from '../data/student-data-store';

const renderProgressHelp = () =>
  (
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
  );

const renderConceptKey = () =>
  (
    <div>
      <h2>Concepts Report:</h2>
      <p>
        Geniventure&#39;s intelligent tutoring system evaluates your students&#39; conceptual understanding.
        Red and yellow flags indicate the degree to which students are struggling with concepts.
        Students with a check show evidence of mastering the concept.
      </p>
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

const renderHelpTabs = (toggleHelp, helpTypeSelection) => {
  const progressTabClasses = "tab" + (helpTypeSelection !== 'Progress' ? " inactive" : "");
  const conceptTabClasses = "tab" + (helpTypeSelection !== 'Concepts' ? " inactive" : "");
  return (
    <div>
      <div className={progressTabClasses}>Progress Report Help</div>
      <div className={conceptTabClasses}>Concepts Report Help</div>
    </div>
  )
}

const renderHelp = (toggleHelp, helpTypeSelection) => {
  const helpContent = helpTypeSelection === 'Progress' ? renderProgressHelp() : renderConceptKey();
  return (
    <div id="help-modal" className="modal">
      <h1>Help</h1>
      <div className="top-row">
        { renderHelpTabs(toggleHelp, helpTypeSelection) }
      </div>
      { helpContent }
      <button id="close-help" className="button-on-white" onClick={toggleHelp}>Close</button>
    </div>
  );
}

module.exports = {
  renderProgressHelp,
  renderConceptKey,
  renderHelpTabs,
  renderHelp
};
