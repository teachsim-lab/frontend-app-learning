import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';
import { useContextId } from '../../../../data/hooks';
import { useModel } from '../../../../generic/model-store';
import { showUngradedAssignments } from '../../utils';

import messages from '../messages';

const DetailedGrades = () => {
  const intl = useIntl();
  const { administrator } = getAuthenticatedUser();
  const courseId = useContextId();
  const {
    org,
    tabs,
  } = useModel('courseHomeMeta', courseId);
  const { gradesFeatureIsFullyLocked } = useModel('progress', courseId);

  const logOutlineLinkClick = () => {
    sendTrackEvent('edx.ui.lms.course_progress.detailed_grades.course_outline_link.clicked', {
      org_key: org,
      courserun_key: courseId,
      is_staff: administrator,
    });
  };

  const overviewTab = tabs.find(tab => tab.slug === 'outline');
  const overviewTabUrl = overviewTab && overviewTab.url;

  const outlineLink = overviewTabUrl && (
    <Hyperlink
      variant="muted"
      isInline
      destination={overviewTabUrl}
      onClick={logOutlineLinkClick}
      tabIndex={gradesFeatureIsFullyLocked ? '-1' : '0'}
    >
      {intl.formatMessage(messages.courseOutline)}
    </Hyperlink>
  );

  return (
    <section className="text-dark-700">
      {overviewTabUrl && !showUngradedAssignments() && (
        <p className="x-small m-0">
          {intl.formatMessage(messages.ungradedAlert, { outlineLink })}
        </p>
      )}
    </section>
  );
};

export default DetailedGrades;
