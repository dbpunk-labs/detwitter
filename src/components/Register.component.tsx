// @ts-nocheck
import React, { memo, useState } from 'react';
import { Modal, Form, Input, Radio, Button, message, Typography, Space } from 'antd';
import { useAsyncFn } from 'react-use';
import { contractAddressAtom, ownerAddressAtom } from '../state';
import { useRecoilValue } from 'recoil';
import * as db3 from '../db3';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text, Link } = Typography;

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
    function onFinish() {
        setVisible(true);
    }
    const [form] = Form.useForm();
    function submitRegister() {
        const { username, gender } = form.getFieldsValue();
        registerFn([username, ownerAddress, gender]);
    }
    const [visible, setVisible] = useState(false);
    return (
        <div className='dtwitter-register'>
            <Modal open title='User info' footer={null} closable={false} maskClosable={false}>
                <Form
                    form={form}
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
                        <Button type='primary' htmlType='submit'>
                            Commit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                style={{ right: 20, margin: 0, float: 'right' }}
                width={350}
                open={visible}
                onCancel={() => setVisible(false)}
                title='DB3 network'
                footer={null}
                closable={false}
                maskClosable={false}
            >
                <Typography>
                    <Title>Sign message</Title>
                    <Paragraph>
                        You are going write into tables. The following sql and/or contracts will be executed:
                    </Paragraph>
                    <Paragraph code>contract.abcde5.twitter. registe_user(name: muran,gender:male)</Paragraph>
                    <Text strong>Estimate Gas Usage: 1.5 db3</Text>
                </Typography>
                <div style={{ textAlign: 'center' }}>
                    <Space>
                        <Button type='primary' loading={registerState.loading} onClick={submitRegister}>
                            Yes
                        </Button>
                        <Button onClick={() => setVisible(false)}>No</Button>
                    </Space>
                </div>
            </Modal>
        </div>
    );
});
export default Register;