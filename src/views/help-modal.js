import React from 'react';
import PropTypes from 'prop-types';
import { StudentDataStore } from '../data/student-data-store';

const renderProgressHelp = () => {
  return (
    <div className="progress-report-help">
      <ul>
        <li>
          You can change the <span className="tip-word">sorting</span> to &quot;progress&quot; to show students
          who have completed the fewest challenges, or by &quot;struggling&quot; to show students who have had
          trouble with recent activities.
        </li>
        <li>
          Click on a <span className="tip-word">challenge number</span> to get more information on each challenge.
        </li>
        <li>
          Click on the <img src="assets/img/blue-toggle.png" width="10" height="10" alt="Blue toggle" /> next to a student name to
          show a detailed report for that student for that challenge.
        </li>
        <li>
          An <span className="tip-word">hourglass</span> icon <img src="assets/img/hourglass.svg" alt="Hourglass" /> next to a student's name indicates the student has
          been idle for at least five minutes.
        </li>
        <li>
          The <span className="tip-word">All Students</span> row shows a summary of how many
          students earned each color crystal.
          <table className="help-key">
            <thead>
              <tr>
                <th>Crystal</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td width="30">
                  <img src="http://geniventure.concord.org/resources/fablevision/venture-pad/gem_blue.png" alt="Blue crystal" width="20" height="32" />
                </td>
                <td>
                  Student completed the challenge perfectly
                </td>
              </tr>
              <tr>
                <td>
                  <img src="http://geniventure.concord.org/resources/fablevision/venture-pad/gem_yellow.png" alt="Yellow crystal" width="20" height="32" />
                </td>
                <td>
                  Student made one mistake or unnecessary move
                </td>
              </tr>
              <tr>
                <td>
                  <img src="http://geniventure.concord.org/resources/fablevision/venture-pad/gem_red.png" alt="Red crystal" width="20" height="32" />
                </td>
                <td>
                  Student made two mistakes or unnecessary moves
                </td>
              </tr>
              <tr>
                <td>
                  <img src="http://geniventure.concord.org/resources/fablevision/venture-pad/dark_crystal.png" alt="Black crystal" width="20" height="32" />
                </td>
                <td>
                  Student made three or more mistakes or unnecessary moves
                </td>
              </tr>
            </tbody>
          </table>
        </li>
        <li>
          <figure>
            <img src="assets/img/crystals-with-numbers.jpg" alt="Crystals with numbers" />
          </figure>
          A <span className="tip-word">B next to a crystal</span> indicates the student received a bonus challenge during the challenge.
        </li>
        <li>
          A <span className="tip-word">number in a crystal</span> shows how many attempts a student made on that challenge. Click the crystal to see
          previous attempts.
        </li>
        <li>
          <figure>
            <img src="assets/img/green-circles.jpg" alt="Green circles" />
          </figure>
          A <span className="tip-word">green circle</span> shows which challenge a student is currently on. If there is no crystal, they have not yet
          completed the challenge. If there is a crystal within the green circle, the student is currently
          repeating the challenge.
        </li>
      </ul>
    </div>
  );
}
const renderConceptKey = () => {
  return (
    <div className="concepts-report-help">
      <p>
        Geniventure&#39;s intelligent tutoring system evaluates your students&#39; conceptual understanding.
        Red <img src="/assets/img/red-flag.png" className="inline-icon" alt="Red flag" /> and yellow <img src="/assets/img/yellow-flag.png" className="inline-icon" alt="Yellow flag" /> flags indicate the degree to which students are struggling with concepts.
        Students with a check <img src="/assets/img/blue-check.png" className="inline-icon" alt="Blue flag" /> show evidence of mastering the concept.
      </p>
      <figure className="help-illustration">
        <img src="/assets/img/concept-details.gif" alt="Illustration of clicking on concept column header" />
        <figcaption><strong>Figure 1.</strong> Viewing related traits and concept location.</figcaption>
      </figure>
      <h3>
        Viewing Concept Details
      </h3>
      <p>
        Click on a column header to see more detail about each concept as well as related traits and where to find the concept in the game.
      </p>
    </div>
  );
};

const renderHelpTabs = (toggleHelp, helpTypeSelection, helpTypeSelectionChange) => {
  const progressTabClasses = "tab" + (helpTypeSelection !== 'Progress' ? " inactive" : "");
  const conceptTabClasses = "tab" + (helpTypeSelection !== 'Concepts' ? " inactive" : "");
  return (
    <div>
      <div className={progressTabClasses} onClick={() => helpTypeSelectionChange("Progress")}>Progress Report Help</div>
      <div className={conceptTabClasses} onClick={() => helpTypeSelectionChange("Concepts")}>Concepts Report Help</div>
    </div>
  );
};

const HelpModal = (props) => {
  const helpContent = props.helpTypeSelection === 'Progress' ? renderProgressHelp() : renderConceptKey();
  return (
    <div id="help-modal" className="modal">
      <h1>Help</h1>
      <div className="top-row">
        { renderHelpTabs(props.toggleHelp, props.helpTypeSelection, props.helpTypeSelectionChange) }
      </div>
      { helpContent }
      <button id="close-help" className="button-on-white" onClick={props.toggleHelp}>Close</button>
    </div>
  );
};

HelpModal.propTypes = {
  helpTypeSelection: PropTypes.string,
  toggleHelp: PropTypes.func,
  helpTypeSelectionChange: PropTypes.func
};

module.exports = HelpModal;
