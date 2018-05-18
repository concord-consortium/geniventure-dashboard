import React from 'react';
import { StudentDataStore } from '../data/student-data-store';

const renderProgressHelp = () =>
  (
    <div className="progress-report-help">
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

const renderConceptKey = () => {
  return (
    <div className="concepts-report-help">
      <p>
        Geniventure&#39;s intelligent tutoring system evaluates your students&#39; conceptual understanding.
        Red <img src="/assets/img/red-flag.png" className="inline-icon" /> and yellow <img src="/assets/img/yellow-flag.png" className="inline-icon" /> flags indicate the degree to which students are struggling with concepts.
        Students with a check <img src="/assets/img/blue-check.png" className="inline-icon" /> show evidence of mastering the concept.
      </p>
      <dl>
        {
          StudentDataStore.concepts.map(concept => {
            if (!!concept.trait && !!concept.location) {
              return [
                <dt>{concept.longer}</dt>,
                <dd>{concept.description}</dd>,
                <dd className="concept-trait"><strong>Trait:</strong> {concept.trait}</dd>,
                <dd className="concept-location"><strong>Location:</strong> {concept.location}</dd>
              ]
            } else if (!!concept.trait) {
              return [
                <dt>{concept.longer}</dt>,
                <dd>{concept.description}</dd>,
                <dd className="concept-trait"><strong>Trait:</strong> {concept.trait}</dd>
              ]
            } else if (!!concept.location) {
              return [
                <dt>{concept.longer}</dt>,
                <dd>{concept.description}</dd>,
                <dd className="concept-location"><strong>Location:</strong> {concept.location}</dd>
              ]
            } else {
              return [
                <dt>{concept.longer}</dt>,
                <dd>{concept.description}</dd>
              ]
            }
          })
        }
      </dl>
    </div>
  );
}

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

const HelpModal = (props) => {
  const helpContent = props.helpTypeSelection === 'Progress' ? renderProgressHelp() : renderConceptKey();
  return (
    <div id="help-modal" className="modal">
      <h1>Help</h1>
      <div className="top-row">
        { renderHelpTabs(props.toggleHelp, props.helpTypeSelection) }
      </div>
      { helpContent }
      <button id="close-help" className="button-on-white" onClick={props.toggleHelp}>Close</button>
    </div>
  );
}

module.exports = {
  renderProgressHelp,
  renderConceptKey,
  renderHelpTabs,
  HelpModal
};
