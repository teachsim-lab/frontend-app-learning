import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'learn.contentLock.content.locked': {
    id: 'learn.contentLock.content.locked',
    defaultMessage: 'Content Locked',
    description: 'Message shown to indicate that a piece of content is unavailable and has a prerequisite.',
  },
  'learn.contentLock.complete.prerequisite': {
    id: 'learn.contentLock.complete.prerequisite',
    defaultMessage: "You must complete the prerequisite: ''{prereqSectionName}'' to access this content.",
    description: 'Message shown to indicate which prerequisite the student must complete prior to accessing the locked content.  {prereqSectionName} is the name of the prerequisite.',
  },
  'learn.contentLock.complete.unit.prerequisite': {
    id: 'learn.contentLock.complete.unit.prerequisite',
    defaultMessage: "You must complete the prerequisite unit: ''{prereqSectionName}'' to access this content.",
    description: 'Message shown to indicate which prerequisite unit the student must complete prior to accessing the locked content.  {prereqSectionName} is the name of the prerequisite unit.',
  },
  'learn.contentLock.goToSection': {
    id: 'learn.contentLock.goToSection',
    defaultMessage: 'Go To Prerequisite Section',
    description: 'A button users can click that navigates their browser to the prerequisite of this section.',
  },
  'learn.contentLock.goToUnit': {
    id: 'learn.contentLock.goToUnit',
    defaultMessage: 'Go To Prerequisite Unit',
    description: 'A button users can click that navigates their browser to the prerequisite unit.',
  },
});

export default messages;
