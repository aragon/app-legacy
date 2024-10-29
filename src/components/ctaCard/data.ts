import {CreateDAO} from 'utils/paths';

import learnImg from '../../assets/images/learnDao.svg';
import buildFaster from '../../assets/images/buildFaster.svg';
import createDaoImg from '../../assets/images/createDao.svg';
import {i18n} from '../../../i18n.config';

// temporary for review
const CTACards = [
  {
    actionAvailable: true,
    actionLabel: i18n.t('cta.create.actionLabel'),
    path: CreateDAO,
    imgSrc: createDaoImg,
    subtitle: i18n.t('cta.create.description'),
    title: i18n.t('cta.create.title'),
    isPrimary: true,
  },
  {
    actionAvailable: true,
    actionLabel: i18n.t('explore.learn.linkLabel'),
    path: i18n.t('explore.learn.linkURL'),
    imgSrc: learnImg,
    subtitle: i18n.t('cta.learn.description'),
    title: i18n.t('cta.learn.title'),
    isPrimary: false,
  },
  {
    actionAvailable: true,
    actionLabel: i18n.t('cta.build.actionLabel'),
    path: i18n.t('explore.build.linkURL'),
    imgSrc: buildFaster,
    subtitle: i18n.t('cta.build.description'),
    title: i18n.t('cta.build.title'),
    isPrimary: false,
  },
];

export {CTACards};
