import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Appoinment = () => {

  const {docId} = useParams()
  const {doctors} = useContext(AppContext)

  const [ docInfo,setDocInfo ] = useState([])

  const fetchDocInfo = async () =>{
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
    console.log(docInfo.image)
  }

  useEffect(()=>{
    fetchDocInfo()
  },[doctors,docId])

  return (
    <div>
        {/**--------------doctor details--------- */}
        <div>
          <div>
              <img src={docInfo.image} alt="" />
          </div>
        </div>
    </div>
  )
}

export default Appoinment