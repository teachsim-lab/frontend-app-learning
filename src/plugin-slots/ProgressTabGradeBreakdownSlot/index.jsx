import { useModel } from '@src/generic/model-store';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import React from 'react';
import DetailedGrades from '../../course-home/progress-tab/grades/detailed-grades/DetailedGrades';
import GradeSummary from '../../course-home/progress-tab/grades/grade-summary/GradeSummary';
import { useContextId } from '../../data/hooks';

const ProgressTabGradeBreakdownSlot = () => {
  const courseId = useContextId();
  const { gradesFeatureIsFullyLocked, hasActiveCertificate } = useModel('progress', courseId);
  const applyLockedOverlay = gradesFeatureIsFullyLocked ? 'locked-overlay' : '';
  return (
    <PluginSlot
      id="org.openedx.frontend.learning.progress_tab_grade_breakdown.v1"
      idAliases={['progress_tab_grade_breakdown_slot']}
    >
      <div
        className={`grades my-4 p-4 rounded raised-card ${applyLockedOverlay}`}
        aria-hidden={gradesFeatureIsFullyLocked}
      >
        {/* TeachSim customization: only show the grade summary when the
            course has an active certificate configured (see PDF item 3). */}
        {hasActiveCertificate && <GradeSummary />}
        <DetailedGrades />
      </div>
    </PluginSlot>
  );
};

ProgressTabGradeBreakdownSlot.propTypes = {};

export default ProgressTabGradeBreakdownSlot;
