import React, { useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useHistory } from "react-router-dom";

import './QuestionDetailPage.css';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';

//완료: 질문 추가, 시험지 전체 삭제, 질문 삭제
//아직: 질문 수정
const QuestionDetailPage = () => {
    const history = useHistory();
    const [ exam, setExam ] = useState('');
    const [ isExam, setIsExam ] = useState(false);
    const [ editId, setEditId ] = useState(-1);
    const [ editQuest, setEditQuest ] = useState('');
    const [ editAns, setEditAns ] = useState(null);
    const [cookies, setCookie] = useCookies(['accessToken']);
    const config = {
      headers: { 'Authorization':'Bearer '+ cookies.accessToken } 
    }

    //새로운 질문 추가
    const [ newQuest, setNewQuest  ] = useState('')
    const [ newAns, setNewAns ] = useState(-1)

    const onChangeNewQuest = (e) => {
        setNewQuest(e.target.value);
      }

    const onChangeNewAnsYes = (e) => {
        const {value} = e.target;
        setNewAns(1)
        console.log(newAns)
    }

    const onChangeNewAnsNo = (e) => {
        const {value} = e.target;
        setNewAns(0)
        console.log(newAns)
    }

    const addNewQuest = () => {
      if(!newQuest | newAns < 0) {
          alert('질문과 정답을 제대로 작성해주세요!')
      }else{
          const ExamData = {
            "contentList": [newQuest],
            "correctAnswerList": [newAns]
          }
          axios.post('/question/create', ExamData, config)
            .then(() => {
              setNewQuest('')
              setNewAns(-1)
                history.go('/question/detail')
            })
            .catch((error) => console.log(error))
      }
    }

  //만들어둔 시험 문제 get
  useEffect(() => {
    setTimeout(() => {
      const fetchData = async() => {
        setIsExam(true);
        try {
          const getExam = await axios.get(`/question/list`,config);  
          setExam(getExam.data)
          console.log(getExam.data,'exam')
        } catch(e) {
          console.log(e);
        } 
        setIsExam(false);
      };
      fetchData();
    },1000);
    }, []);

      if(isExam){
        return <div>로딩중</div>
      }
    
      if(!exam){
        return null;
      }

    //시험지 전체 삭제
    const delExam = () => {
        axios.delete('/question/delete', config)
        .then(() => {
            history.push('/question')
        })
        .catch((error) => console.log(error))
    }

    //질문 개별 수정 및 삭제

    //질문 수정
    const EditQuestion = (e) => {
      const {id, value} = e.target;
      setEditQuest(e.target)
    }
    //정답 수정
    const EditAnswerYes = (e) => {
      const {id, value} = e.target;
      setEditAns(true)
      setExam(exam.map((item) =>
      item.key === id ? {...item, ans:1} : item))
    }
    const EditAnswerNo = (e) => {
      const {id, value} = e.target;
      setEditAns(false)
      setExam(exam.map((item) =>
      item.key === id ? {...item, ans:1} : item))
    }

    const updateQuest = (Id) => {
      setEditId(Id)
      // console.log(Id,'수정')
      // console.log(exam,'exam')
      {exam.filter((question) => {
        if( question.questionId == Id){
          console.log(question.content,'수정할거')
          
          // const ExamData = {
          //   "content": ,
          //   "correctAnswer": 
          // }
          // console.log(ExamData,'보낼거')
          // axios.put(`/question/update/${Id}`, ExamData, config)
          //   .then(() => {
          //       history.push('/question/detail')
          //       history.go();
          //   })
          //   .catch((error) => console.log(error))
        }
      })};
    }

    //삭제
    const deleteQuest = (Id) => {
      if(exam.length>5){
        axios.delete(`/question/delete/${Id}`, config)
          .then(() => {
            //push하니까 안됨
              history.go('/question/detail')
          })
          .catch((error) => console.log(error))
      }else{
        alert('질문은 최소 5개여야합니다!')
      }
    }
            
  return (
    <div>
        {exam.map((item) => (
          <React.Fragment>
            <div>
            {editId==item.questionId ? (
              <div>
                <input 
                type="text"
                id={item.questionId}
                value={item.content}
                onChange={EditQuestion}/>
                <div>
                  <Radio
                    checked={item.correctAnswer}
                    onChange={EditAnswerYes}
                    id={item.questionId}
                    value="true"
                    name="radio-button-demo"
                    inputProps={{ 'aria-label': '예' }}
                  />예
                  <Radio
                    checked={!item.correctAnswer}
                    onChange={EditAnswerNo}
                    id={item.questionId}
                    value="false"
                    name="radio-button-demo"
                    inputProps={{ 'aria-label': '아니오' }}
                  />아니오
                  </div>
                </div>
                ) : (
                  <div style={{display:"flex", flexDirection:"row"}}>
                    <h6 key={item.questionId} item={item}>
                      {item.content}
                    </h6>
                    {item.correctAnswer ? (
                      <h6>정답: 예</h6>
                    ) : (
                      <h6>정답: 아니오</h6>
                    )}
                    <button onClick={() => updateQuest(item.questionId)}>수정</button>
                    <button onClick={() => deleteQuest(item.questionId)}>삭제</button>
                  </div>
                  
                )}
            </div>
          </React.Fragment>
        ))}

        {/* 질문 추가 부분 */}
        <div className="new-quest-box">
          <TextField
            id="outlined-full-width"
            label="문제"
            style={{ margin: 8 }}
            placeholder="추가 문제를 써주세요!"
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            value={newQuest}
            onChange={onChangeNewQuest}
          />
          <div>
            <Radio
              checked={newAns===1}
              onChange={onChangeNewAnsYes}
              value="1"
              name="radio-button-demo"
              inputProps={{ 'aria-label': '예' }}
            />예
            <Radio
              checked={newAns===0}
              onChange={onChangeNewAnsNo}
              value="0"
              name="radio-button-demo"
              inputProps={{ 'aria-label': '아니오' }}
            />아니오
          </div>
        </div>
        <button onClick={addNewQuest}>추가</button>
        <br />
        
        {/* 목록으로 돌아가기 & 시험지 통째로 삭제 */}
        <Link to="/question">
            <button className="exam-update-btn">취소</button>
        </Link>
        <button className="exam-delete-btn"
        onClick={delExam}>시험지 삭제</button>
    </div>
  );
  };
  
  export default QuestionDetailPage;