// @ts-nocheck
import React, { memo, useState } from 'react';
import { Modal, Form, Input, Radio, Button, message } from 'antd';
import { useAsyncFn } from 'react-use';
import { contractAddressAtom, ownerAddressAtom } from '../state';
import { useRecoilValue } from 'recoil';
import * as db3 from '../db3';
import { useNavigate } from 'react-router-dom';

const Register: React.FC<{}> = memo(props => {
    const ownerAddress = useRecoilValue(ownerAddressAtom);
    const contractAddress = useRecoilValue(contractAddressAtom);
    const navigate = useNavigate();
    const [registerState, registerFn] = useAsyncFn(
        async params => {
            try {
                const { status, msg } = await db3.callContract(ownerAddress, contractAddress, {
                    method: 'register_user',
                    args: params,
                });
                if (status === 0) {
                    message.success('Registration successful!');
                    localStorage.setItem('dtwitter_isRegister', '1');
                    navigate('/user');
                } else {
                    message.error(msg);
                }
            } catch (error) {
                console.error(error);
            }
        },
        [ownerAddress, contractAddress],
    );
    function onFinish(values: any) {
        registerFn(Object.values(values));
    }
    return (
        <div className='dtwitter-register'>
            <Modal open title='User info' footer={null} closable={false}>
                <Form
                    name='basic'
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    autoComplete='off'
                >
                    <Form.Item
                        label='Username'
                        name='username'
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label='address'
                        name='address'
                        rules={[{ required: true, message: 'Please input your address!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label='Gender'
                        name='gender'
                        rules={[{ required: true, message: 'Please select your gender!' }]}
                    >
                        <Radio.Group>
                            <Radio value='male'>male</Radio>
                            <Radio value='female'>female</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type='primary' htmlType='submit' loading={registerState.loading}>
                            Commit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
});
export default Register;
