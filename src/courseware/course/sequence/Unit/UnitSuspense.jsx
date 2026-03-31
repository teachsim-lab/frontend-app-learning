import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';

import { useModel } from '@src/generic/model-store';
import PageLoading from '@src/generic/PageLoading';
import { GatedUnitContentMessageSlot } from '../../../../plugin-slots/GatedUnitContentMessageSlot';

import messages from '../messages';
import ContentLock from '../content-lock';
import HonorCode from '../honor-code';
import * as hooks from './hooks';
import { modelKeys } from './constants';

const UnitSuspense = ({
  courseId,
  id,
}) => {
  const { formatMessage } = useIntl();
  const shouldDisplayHonorCode = hooks.useShouldDisplayHonorCode({ courseId, id });
  const unit = useModel(modelKeys.units, id);
  const meta = useModel(modelKeys.coursewareMeta, courseId);
  const shouldDisplayContentGating = (
    meta.contentTypeGatingEnabled && unit.containsContentTypeGatedContent
  );

  // Check for unit-level prerequisites
  const isUnitGated = unit && unit.isGated;

  return (
    <>
      {isUnitGated && unit.gatedContent && (
        <Suspense fallback={<PageLoading srMessage={formatMessage(messages.loadingLockedContent)} />}>
          <ContentLock
            courseId={courseId}
            sequenceTitle={unit.title}
            prereqSectionName={unit.gatedContent.prereqSectionName}
            prereqId={unit.gatedContent.prereqId}
            isUnit
          />
        </Suspense>
      )}
      {shouldDisplayContentGating && (
        <Suspense fallback={<PageLoading srMessage={formatMessage(messages.loadingLockedContent)} />}>
          <GatedUnitContentMessageSlot courseId={courseId} />
        </Suspense>
      )}
      {shouldDisplayHonorCode && (
        <Suspense fallback={<PageLoading srMessage={formatMessage(messages.loadingHonorCode)} />}>
          <HonorCode courseId={courseId} />
        </Suspense>
      )}
    </>
  );
};

UnitSuspense.propTypes = {
  courseId: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default UnitSuspense;
