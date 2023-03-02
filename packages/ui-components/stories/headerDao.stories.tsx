import React from 'react';
import {Meta, Story} from '@storybook/react';
import {HeaderDao, HeaderDaoProps} from '../src';

export default {
  title: 'Components/Headers/Dao',
  component: HeaderDao,
} as Meta;

const Template: Story<HeaderDaoProps> = args => <HeaderDao {...args} />;

export const Dao = Template.bind({});
Dao.args = {
  daoName: 'DaoName',
  daoEnsName: 'daoName.dao.eth',
  description:
    'We are a community that loves trees and the planet. We track where forestation is increasing (or shrinking), fund people who are growing and protecting trees We are a community that loves trees and the planet. We track where forestation is increasing (or shrinking), fund people who are growing and protecting trees We are a community that loves trees and the planet.',
  created_at: 'March 2022',
  daoChain: 'Arbitrum',
  daoType: 'Wallet Based',
  daoUrl: 'app.aragon.org/#/daos/arbitrum/daoName',
  translation: {
    readMore: 'Read more',
    readLess: 'Read less',
  },
  links: [
    {
      label: 'Website',
      href: 'https://google.com',
    },
    {
      label: 'Discord',
      href: 'https://google.com',
    },
    {
      label: 'Forum',
      href: 'https://google.com',
    },
  ],
};
