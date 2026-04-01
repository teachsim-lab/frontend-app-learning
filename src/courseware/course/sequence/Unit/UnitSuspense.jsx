import React, { Suspense, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';
import { useDispatch } from 'react-redux';

import { useModel } from '@src/generic/model-store';
import PageLoading from '@src/generic/PageLoading';
import { GatedUnitContentMessageSlot } from '../../../../plugin-slots/GatedUnitContentMessageSlot';
import { checkBlockCompletion, fetchSequence } from '../../../data';

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
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const shouldDisplayHonorCode = hooks.useShouldDisplayHonorCode({ courseId, id });
  const unit = useModel(modelKeys.units, id);
  const meta = useModel(modelKeys.coursewareMeta, courseId);
  const shouldDisplayContentGating = (
    meta.contentTypeGatingEnabled && unit.containsContentTypeGatedContent
  );

  // Check for unit-level prerequisites
  const isUnitGated = unit && unit.isGated;

  useEffect(() => {
    const prereqId = unit?.gatedContent?.prereqId;
    const sequenceId = unit?.sequenceId;
    if (!courseId || !sequenceId || !prereqId || !isUnitGated) {
      return undefined;
    }

    const isPreview = pathname.startsWith('/preview');

    let cancelled = false;

    const refreshIfUnlocked = async () => {
      const prereqIsComplete = await dispatch(checkBlockCompletion(courseId, sequenceId, prereqId));
      if (cancelled) {
        return;
      }

      if (prereqIsComplete) {
        dispatch(fetchSequence(sequenceId, isPreview));
      }
    };

    refreshIfUnlocked();
    const intervalId = setInterval(refreshIfUnlocked, 5000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [courseId, dispatch, isUnitGated, pathname, unit?.gatedContent?.prereqId, unit?.sequenceId]);

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
