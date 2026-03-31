import React from 'react';
import { Factory } from 'rosie';
import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';

import {
  fireEvent, initializeMockApp, logUnhandledRequests, render, screen, act,
} from '../../setupTest';
import { appendBrowserTimezoneToUrl, executeThunk } from '../../utils';
import * as thunks from '../data/thunks';
import initializeStore from '../../store';
import ProgressTab from './ProgressTab';
import LoadedTabPage from '../../tab-page/LoadedTabPage';

const mockCoursewareSearchParams = jest.fn();

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');
jest.mock('../courseware-search/hooks', () => ({
  ...jest.requireActual('../courseware-search/hooks'),
  useCoursewareSearchParams: () => mockCoursewareSearchParams,
}));

const coursewareSearch = {
  query: '',
  filter: '',
  setQuery: jest.fn(),
  setFilter: jest.fn(),
  clearSearchParams: jest.fn(),
};

const mockSearchParams = ((props = coursewareSearch) => {
  mockCoursewareSearchParams.mockReturnValue(props);
});

describe('Progress Tab', () => {
  let axiosMock;

  const store = initializeStore();
  const defaultMetadata = Factory.build('courseHomeMetadata');
  const defaultTabData = Factory.build('progressTabData');

  const courseId = defaultMetadata.id;
  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);
  const progressUrl = new RegExp(`${getConfig().LMS_BASE_URL}/api/course_home/progress/*`);
  const masqueradeUrl = `${getConfig().LMS_BASE_URL}/courses/${courseId}/masquerade`;

  function setMetadata(attributes, options) {
    const courseMetadata = Factory.build('courseHomeMetadata', attributes, options);
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
  }

  function setTabData(attributes, options) {
    const progressTabData = Factory.build('progressTabData', attributes, options);
    axiosMock.onGet(progressUrl).reply(200, progressTabData);
  }

  async function fetchAndRender() {
    await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);
    await act(async () => render(<ProgressTab />, { store }));
  }

  beforeEach(async () => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    // Set defaults for network requests
    axiosMock.onGet(courseMetadataUrl).reply(200, defaultMetadata);
    axiosMock.onGet(progressUrl).reply(200, defaultTabData);
    axiosMock.onGet(masqueradeUrl).reply(200, { success: true });

    // Mock courseware search params
    mockSearchParams();

    logUnhandledRequests(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Related links', () => {
    beforeEach(() => {
      sendTrackEvent.mockClear();
    });

    it('sends event on click of dates tab link', async () => {
      await fetchAndRender();
      sendTrackEvent.mockClear();

      const datesTabLink = screen.getByRole('link', { name: 'Dates' });
      fireEvent.click(datesTabLink);

      expect(sendTrackEvent).toHaveBeenCalledTimes(1);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.related_links.clicked', {
        org_key: 'edX',
        courserun_key: courseId,
        is_staff: false,
        link_clicked: 'dates',
      });
    });

    it('sends event on click of outline tab link', async () => {
      await fetchAndRender();
      sendTrackEvent.mockClear();

      const outlineTabLink = screen.getAllByRole('link', { name: 'Course outline' });
      fireEvent.click(outlineTabLink[1]); // outlineTabLink[0] corresponds to the link in the DetailedGrades component

      expect(sendTrackEvent).toHaveBeenCalledTimes(1);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.related_links.clicked', {
        org_key: 'edX',
        courserun_key: courseId,
        is_staff: false,
        link_clicked: 'course_outline',
      });
    });
  });

  describe('Access expiration masquerade banner', () => {
    it('renders banner when masquerading as a user', async () => {
      setMetadata({ is_enrolled: true, original_user_is_staff: true });
      setTabData({
        access_expiration: {
          expiration_date: '2020-01-01T12:00:00Z',
          masquerading_expired_course: true,
        },
      });
      await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);
      await act(async () => render(<LoadedTabPage courseId={courseId} activeTabSlug="progress">...</LoadedTabPage>, { store }));
      expect(screen.getByTestId('instructor-toolbar')).toBeInTheDocument();
      expect(screen.getByText('This learner no longer has access to this course. Their access expired on', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('1/1/2020', { exact: false })).toBeInTheDocument();
    });
    it('does not render banner when not masquerading', async () => {
      setMetadata({ is_enrolled: true, original_user_is_staff: true });
      setTabData({
        access_expiration: {
          expiration_date: '2020-01-01T12:00:00Z',
          masquerading_expired_course: false,
        },
      });
      await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);
      await act(async () => render(<LoadedTabPage courseId={courseId} activeTabSlug="progress">...</LoadedTabPage>, { store }));
      expect(screen.queryByText('This learner no longer has access to this course. Their access expired on', { exact: false })).not.toBeInTheDocument();
      expect(screen.queryByText('1/1/2020', { exact: false })).not.toBeInTheDocument();
    });
  });

  describe('Course start masquerade banner', () => {
    it('renders banner when masquerading as a user', async () => {
      setMetadata({
        is_enrolled: true,
        original_user_is_staff: true,
        is_staff: false,
        start: '2999-01-01T00:00:00Z',
      });
      await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);
      await act(async () => render(<LoadedTabPage courseId={courseId} activeTabSlug="progress">...</LoadedTabPage>, { store }));
      expect(screen.getByTestId('instructor-toolbar')).toBeInTheDocument();
      expect(screen.getByText('This learner does not yet have access to this course. The course starts on', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('1/1/2999', { exact: false })).toBeInTheDocument();
    });
    it('does not render banner when not masquerading', async () => {
      setMetadata({
        is_enrolled: true,
        original_user_is_staff: true,
        is_staff: true,
        start: '2999-01-01T00:00:00Z',
      });
      await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);
      await act(async () => render(<LoadedTabPage courseId={courseId} activeTabSlug="progress">...</LoadedTabPage>, { store }));
      expect(screen.queryByText('This learner does not yet have access to this course. The course starts on', { exact: false })).not.toBeInTheDocument();
      expect(screen.queryByText('1/1/2999', { exact: false })).not.toBeInTheDocument();
    });
  });

  describe('Viewing progress page of other students by changing url', () => {
    it('Changing the url changes the header', async () => {
      setMetadata({ is_enrolled: true });
      setTabData({ username: 'otherstudent' });

      await executeThunk(thunks.fetchProgressTab(courseId, 10), store.dispatch);
      await act(async () => render(<ProgressTab />, { store }));

      expect(screen.getByText('Course progress for otherstudent')).toBeInTheDocument();
    });
  });
});
