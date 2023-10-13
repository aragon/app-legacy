import {type Meta, type StoryObj} from '@storybook/react';
import React, {useState} from 'react';
import {ButtonText} from '../button';
import {Modal, type ModalProps} from './modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
};

type Story = StoryObj<typeof Modal>;

const ModalDefault = ({onClose, onInteractOutside, ...props}: ModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ButtonText label="Open dialog" onClick={() => setIsOpen(true)} />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} {...props}>
        <div
          style={{
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
          }}
        >
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime
            mollitia, molestiae quas vel sint commodi repudiandae consequuntur
            voluptatum laborum numquam blanditiis harum quisquam eius sed odit
            fugiat iusto fuga praesentium optio, eaque rerum!
          </p>
          <div
            style={{height: 300, width: '100%', backgroundColor: 'lightblue'}}
          />
          <p>
            Provident similique accusantium nemo autem. Veritatis obcaecati
            tenetur iure eius earum ut molestias architecto voluptate aliquam
            nihil, eveniet aliquid culpa officia aut! Impedit sit sunt quaerat,
            odit, tenetur error, harum nesciunt ipsum debitis quas aliquid.
            Reprehenderit, quia.
          </p>
          <div
            style={{height: 300, width: '100%', backgroundColor: 'lightblue'}}
          />
          <p>Quo neque error repudiandae fuga?</p>
        </div>
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: args => <ModalDefault {...args} />,
};

export default meta;
