import React, { useState, useEffect } from 'react';

// CSS
import './AnswerResultPage.css';

// Axios
import axios from 'axios';

// Cookie
import { useCookies } from 'react-cookie';

// React router dom
import { Link } from 'react-router-dom';

// History
import { useHistory } from "react-router-dom";

const AnswerResultPage = () => {
  const history = useHistory();
  const [ cookies, setCookie ] = useCookies(['accessToken']);
  const [ loading, setLoading ] = useState(false);

  const [ examiner, setExaminer ] = useState('');
  const [ score, setScore ] = useState('');

  const config = {
    headers: {
      'Authorization': 'Bearer ' + cookies.accessToken
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          '/api/answer/list', config
        );
        setExaminer(response.data[0].examiner.id)
        setScore((response.data[0].correctRate));
        console.log(response.data)
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const createChatRoom = () => {
    console.log(examiner)
    axios.post('/api/conversation', {examiner}, config)
      .then((response) => {
        console.log(response)
        history.push('/conversation/'+`${response.data}`)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <div style={{minHeight:"531px", padding:"120px 0", display:"flex", flexDirection:"column", alignItems:"center"}}>
      <h2>레시피 조합 결과 상대방과의 유사도는</h2>
      <h2>{(score * 100).toFixed(0)}% 입니다.</h2>
      {score >= 0.7 && (
        <div className="centerBtn">
          <h2 style={{color:"#5e1e27"}}>상대방의 음성을 들어보세요!</h2>
          <button onClick={createChatRoom} className="chatBtn">음성듣기</button>
          <Link className="exitBtn" to="/main">나가기</Link>
        </div>
      )}
      {score < 0.7 && (
        <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
          <h2 style={{color:"rgb(226,49,40)"}}>아쉽게도 취향에 맞는 상대가 아니었던 것 같네요.</h2>
          <Link className="exitBtn" style={{textDecoration:"none"}} to="/main">나가기</Link>
        </div>
      )}
    </div>
  )
};

export default AnswerResultPage;