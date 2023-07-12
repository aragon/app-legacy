import {CreateDAO} from 'utils/paths';

import learnImg from '../../public/learnDao.svg';
import buildFaster from '../../public/buildFaster.svg';
import createDaoImg from '../../public/createDao.svg';
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
  },
  {
    actionAvailable: true,
    actionLabel: i18n.t('explore.learn.linkLabel'),
    path: i18n.t('explore.learn.linkURL'),
    imgSrc: learnImg,
    subtitle: i18n.t('cta.learn.description'),
    title: i18n.t('cta.learn.title'),
  },
  {
    actionAvailable: false,
    actionLabel: i18n.t('cta.build.actionLabel'),
    path: '',
    imgSrc: buildFaster,
    subtitle: i18n.t('cta.build.description'),
    title: i18n.t('cta.build.title'),
  },
];

export {CTACards};
