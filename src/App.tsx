import { useState } from 'react'
import { createConnectTransport, createPromiseClient } from '@bufbuild/connect-web'
import { ElizaService } from './gen/buf/connect/demo/eliza/v1/eliza_connectweb'
import { IntroduceRequest } from './gen/buf/connect/demo/eliza/v1/eliza_pb'
import './App.css'
interface Response {
  text: string,
  sender: 'eliza' | 'user'
}

function App() {

  const [statement, setStatement] = useState<string>('')
  const [introFinished, setIntroFinished] = useState<boolean>(false)
  const [responses, setResponses] = useState<Response[]>([
    {
      text: 'What is your name',
      sender: 'eliza'
    }
  ])

  const client = createPromiseClient(
    ElizaService,
    createConnectTransport({
      baseUrl: 'https://demo.connect.build'
    })
  )

  const send = async (sentence: string) => {
    setResponses((resp) => [
      ...resp,
      {
        text: sentence,
        sender: 'user'
      }
    ])

    setStatement('')

    if (introFinished) {
      const response = await client.say({
        sentence
      })

      setResponses((resp => [
        ...resp,
        {
          text: response.sentence,
          sender: 'eliza'
        }
      ]))

    } else {
      const request = new IntroduceRequest({
        name: sentence
      })

      for await (const response of client.introduce(request)) {
        setResponses((resp) => [
          ...resp,
          {
            text: response.sentence,
            sender: 'eliza'
          }
        ])
      }
      setIntroFinished(true)
    }
  }

  const handleStatementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatement(event.target.value)
  }

  const handleSend = () => {
    send(statement)
  }

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <div>
      <h3 style={{textAlign:'center'}}>Start Conversing With Eliza... </h3>
      <div className='container'>
        {responses.map((resp, i) => {
          return (
            <div
              key={`resp${1}`}
              className={
                resp.sender === 'eliza' ?
                  'eliza-resp-container'
                  : 'user-resp-container'
              }
            >
              {resp.sender==='eliza'?<p className='resp-text'><span style={{margin:'0 .2rem'}}>Eliza:</span>{resp.text}</p>:
                <p className='resp-text'><span style={{margin:'0 .2rem'}}>User:</span>{resp.text}</p>
              }
            </div>
          )
        })}

        <div className='input-container'>
          <input
            type='text'
            value={statement}
            className='text-input'
            onChange={handleStatementChange}
            onKeyDown={handleKeyPress}
          />

          <button
          className='btn'
            onClick={handleSend}
          >
            Send
          </button>
        </div>

      </div>

    </div>
  )
}

export default App
