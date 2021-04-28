import {
  DeleteOutlined,
  DownloadOutlined,
  PlusCircleOutlined
} from '@ant-design/icons'
import { Button, Input, Space, Switch, Table } from 'antd'
import Text from 'antd/lib/typography/Text'
import Title from 'antd/lib/typography/Title'
import GlobalModal from 'components/GlobalModal'
import firebase from 'firebase'
import md5 from 'md5'
import moment from 'moment'
import * as QRCode from 'qrcode.react'
import React, { useEffect, useRef, useState } from 'react'
import { MODAL_TYPE, PASS } from 'ultis/functions'
import ModalAddTicket from './component/addTicketModal'
import { getColumnSearchProps } from './component/searchInput'

function Home(props) {
  const [isAuth, setIsAuth] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [pass, setPass] = useState('')
  const [tickets, setTickets] = useState([])
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchColumn] = useState('')
  const refInput = useRef()

  useEffect(() => {
    if (isAuth) {
      firebase
        .database()
        .ref('/tickets')
        .on('value', snapshot => {
          const data = snapshot.val()
          let ticketsArray =
            data && Object.keys(data).length > 0
              ? Object.keys(data).map(key => {
                  return {
                    ...data[key],
                    id: key
                  }
                })
              : []
          ticketsArray = ticketsArray.sort((a, b) => b.updatedAt - a.updatedAt)

          setTickets(ticketsArray)
        })
    }
    return () => {
      firebase.database().ref('/tickets').off()
    }
  }, [isAuth])

  const handleKeyPress = event => {
    if (pass.length > 0 && event.key === 'Enter') {
      onInputPass()
    }
  }

  const onInputPass = () => {
    if (md5(pass) === PASS) {
      setIsAuth(true)
    } else {
      GlobalModal.alertMessage('Thông báo', 'Sai mật khẩu')
    }
  }

  const downloadQR = id => {
    const canvas = document.getElementById(id)
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/jpg')
        .replace('image/jpg', 'image/octet-stream')
      let downloadLink = document.createElement('a')
      downloadLink.href = pngUrl
      downloadLink.download = `${id}.jpg`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const handleDelete = record => {
    GlobalModal.alertMessage(
      'Xác nhận',
      'Chắc chắn xóa vé này?',
      MODAL_TYPE.CHOICE,
      () => {
        firebase
          .database()
          .ref('/tickets')
          .child(record.id)
          .remove()
          .catch(error => GlobalModal.alertMessage())
      }
    )
  }

  const handleEnable = (record, checked) => {
    GlobalModal.alertMessage(
      'Xác nhận',
      record.enable ? 'Chắc chắn vô hiệu vé này?' : 'Chắc chắn mở khóa vé này?',
      MODAL_TYPE.CHOICE,
      () => {
        firebase
          .database()
          .ref('/tickets')
          .child(record.id)
          .update({
            ticketId: record.ticketId,
            date: record.date,
            enable: checked
          })
          .catch(error => GlobalModal.alertMessage())
      }
    )
  }

  const handleDownload = record => {
    downloadQR(record.ticketId)
  }

  const ticketColumns = [
    {
      ...getColumnSearchProps(
        'ticketId',
        'Nhập ID',
        searchText,
        setSearchText,
        searchedColumn,
        setSearchColumn,
        refInput
      ),
      title: 'ID',
      dataIndex: 'ticketId',
      key: 'ticketId',
      sorter: (a, b) => a.ticketId.localeCompare(b.ticketId)
    },
    {
      ...getColumnSearchProps(
        'fullname',
        'Nhập tên',
        searchText,
        setSearchText,
        searchedColumn,
        setSearchColumn,
        refInput
      ),
      title: 'Tên',
      dataIndex: 'fullname',
      key: 'fullname',
      sorter: (a, b) => a.fullname.localeCompare(b.fullname)
    },
    {
      ...getColumnSearchProps(
        'email',
        'Nhập email',
        searchText,
        setSearchText,
        searchedColumn,
        setSearchColumn,
        refInput
      ),
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email)
    },
    {
      ...getColumnSearchProps(
        'phoneNumber',
        'Nhập SĐT',
        searchText,
        setSearchText,
        searchedColumn,
        setSearchColumn,
        refInput
      ),
      title: 'SĐT',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber)
    },
    {
      title: 'QR code',
      key: 'qrcode',
      render: (value, record) => {
        return (
          <QRCode
            id={record.ticketId}
            value={`${record.id}.${record.date}.${record.ticketId}`}
          />
        )
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'date',
      key: 'date',
      render: (value, record) => {
        return <Text>{moment(value).format('DD/MM/YYYY HH:mm')}</Text>
      },
      sorter: (a, b) => a.date > b.date
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (value, record) => {
        if (record?.checkInfo?.checkCount < 1) {
          return <Text>CHƯA CHECKIN</Text>
        } else if (record?.checkInfo?.checkCount > 1) {
          return (
            <Text style={{ color: 'red', fontWeight: 700 }}>
              CHECKIN {record?.checkInfo?.checkCount} LẦN
            </Text>
          )
        }
        return (
          <Text style={{ color: 'green', fontWeight: 700 }}>ĐÃ CHECKIN</Text>
        )
      }
    },
    {
      title: 'Vô hiệu hóa',
      dataIndex: 'enable',
      key: 'enable',
      render: (value, record) => {
        return (
          <Space>
            <Switch
              checked={value}
              onChange={checked => {
                handleEnable(record, checked)
              }}
            />
          </Space>
        )
      }
    },
    {
      title: 'Tác vụ',
      key: 'action',
      render: (value, record) => {
        return (
          <Space>
            <DownloadOutlined
              style={{ fontSize: 20 }}
              onClick={() => handleDownload(record)}
            />
            <DeleteOutlined
              style={{ fontSize: 20, color: '#FF0000' }}
              onClick={() => handleDelete(record)}
            />
          </Space>
        )
      }
    }
  ]

  if (!isAuth) {
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <Title level={3} style={{ marginTop: 64 }}>
          Nhập mật khẩu
        </Title>
        <Input
          style={{ width: 200, marginBottom: 24, marginTop: 24 }}
          onChange={event => setPass(event.target.value)}
          placeholder="Nhập mật khẩu"
          value={pass}
          type="password"
          onKeyPress={handleKeyPress}
        />
        <Button type="primary" onClick={onInputPass} size="large">
          Vào
        </Button>
      </div>
    )
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 48 }}
    >
      <Title level={2}>Danh sách vé</Title>
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        style={{ width: 200, marginBottom: 32 }}
        onClick={() => setShowAddModal(true)}
        size="large"
      >
        Thêm vé mới
      </Button>
      <Table columns={ticketColumns} dataSource={tickets} />
      <ModalAddTicket
        isShow={showAddModal}
        closeModal={() => setShowAddModal(false)}
        downloadQR={downloadQR}
      />
    </div>
  )
}

export default Home
