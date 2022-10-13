import React, { memo, useState } from 'react';
import { Button, Space, List, Avatar, Skeleton, Input, message } from 'antd';
import { useRecoilCallback, useRecoilValue, useRecoilValueLoadable } from 'recoil';
import { allUserSelector, followingTwitterSelector } from '../state';
import { useAsyncFn } from 'react-use';
import * as db3 from '../db3';

const Userhome: React.FC<{}> = memo(props => {
    const allUserState = useRecoilValueLoadable(allUserSelector);
    // const followingTwitterState = useRecoilValueLoadable(followingTwitterSelector);
    const [postTwitterState, postTwitter] = useAsyncFn(async (content: string) => {
        try {
            const id = Math.floor(Math.random() * (Date.now() / 600));
            const { status, msg } = await db3.runSqlByOwner(
                `insert into tweets values(${(Date.now() / 1000).toFixed()}, '2022-10-11 12:24:00', '${content}');`,
            );
            if (status === 0) {
                message.success('The operation succeeded!');
            } else {
                message.error(msg);
            }
        } catch (error) {
            console.error(error);
            return;
        }
    });
    const [userContent, setUserContent] = useState('');
    function onClickPost() {
        postTwitter(userContent);
    }
    const [userContentList, setUserContentList] = useState([]);
    const loadUserContentList = useRecoilCallback(({ snapshot }) => async () => {
        const data = await snapshot.getPromise(followingTwitterSelector);
        setUserContentList(data);
    });
    return (
        <div className='user-home'>
            <div className='user-header'>
                <Space>
                    @alice 5axxxx
                    <Button type='link'>following</Button>
                    <Button type='link'>follower</Button>
                </Space>
                <div className='user-container'>
                    <div className='global-user'>
                        <List
                            itemLayout='horizontal'
                            loading={allUserState.state === 'loading'}
                            dataSource={allUserState.state === 'hasValue' ? allUserState.contents : []}
                            renderItem={item => (
                                <List.Item>
                                    <>
                                        <List.Item.Meta title={<a>{item.user_name}</a>} />
                                        <Button type='primary'>follow</Button>
                                    </>
                                </List.Item>
                            )}
                        />
                    </div>
                    <div className='user-content'>
                        <Input.TextArea
                            value={userContent}
                            onChange={e => setUserContent(e.target.value)}
                        ></Input.TextArea>
                        <Button type='primary' loading={postTwitterState.loading} onClick={onClickPost}>
                            Public
                        </Button>
                        <Button type='primary' onClick={loadUserContentList}>
                            Load user content
                        </Button>
                        <List
                            itemLayout='horizontal'
                            dataSource={userContentList}
                            renderItem={item => (
                                <List.Item>
                                    <>
                                        <List.Item.Meta title={<a>{item.twitter}</a>} />
                                        <Button type='primary'>follow</Button>
                                    </>
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});
export default Userhome;
