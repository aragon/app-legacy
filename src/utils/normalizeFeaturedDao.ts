import {IDao, IFeaturedDao} from 'services/aragon-backend/domain/dao';

export const normalizeFeaturedDao = (featuredDao: IFeaturedDao): IDao => {
  return {
    name: featuredDao.daoName,
    description: featuredDao.description,
    logo: featuredDao.avatarUrl,
    daoAddress: featuredDao.daoAddress,
    network: featuredDao.blockchain,
    creatorAddress: '0x0000000000000000000000000000000000000000',
    createdAt: '',
    pluginName: '',
    overrideUrl: featuredDao.urlOverride,
  };
};
