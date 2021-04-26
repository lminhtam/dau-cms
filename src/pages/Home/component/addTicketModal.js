import { Button, Col, Input, Modal, Row, Typography } from 'antd'
import GlobalModal from 'components/GlobalModal'
import firebase from 'firebase'
import { Formik } from 'formik'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import * as yup from 'yup'

const { Text } = Typography

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .label('Email')
    .email('Email hiện tại không hợp lệ')
    .required('* Vui lòng nhập email'),
  phoneNumber: yup
    .string()
    .required('* Vui lòng nhập số điện thoại')
    .matches(/((09|03|07|08|05)+([0-9]{8})\b)/, {
      message: 'Số điện thoại không hợp lệ'
    }),
  fullname: yup
    .string()
    .trim()
    .required('* Vui lòng nhập tên')
    .min(3, 'Tên ít nhất 3 kí tự')
    .matches(
      /[^a-z0-9A-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]/u,
      {
        message: 'Tên không hợp lệ'
      }
    )
})

export default function ModalAddTicket({
  isShow,
  closeModal = () => {},
  downloadQR = values => {}
}) {
  const handleOk = values => {
    onSubmit(values)
    closeModal()
  }

  const handleCancel = () => {
    closeModal()
  }

  const onSubmit = item => {
    const now = new Date().getTime()
    const ticketId = uuidv4()
    const values = {
      ...item,
      ticketId,
      date: now,
      enable: true,
      checkInfo: {
        checkCount: 0,
        checkPerson: null
      }
    }
    firebase
      .database()
      .ref('/tickets')
      .push(values)
      .then(value => {
        setTimeout(() => {
          downloadQR(ticketId)
        }, 1000)
      })
      .catch(error => GlobalModal.alertMessage())
  }

  const handleKeyPress = (event, isValid, values) => {
    if (isValid > 0 && event.key === 'Enter') {
      handleOk(values)
    }
  }

  return (
    <Formik
      initialValues={{
        fullname: '',
        phoneNumber: '',
        email: ''
      }}
      validationSchema={validationSchema}
      onSubmit={values => {
        onSubmit(values)
      }}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        isValid,
        errors,
        touched,
        setFieldTouched
      }) => {
        return (
          <Modal
            title={'Thêm vé'}
            visible={isShow}
            centered
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
              <Button key="cancelButton" onClick={handleCancel} size="large">
                Hủy
              </Button>,
              <Button
                key="okButton"
                size="large"
                type="primary"
                onClick={handleOk}
                disabled={!isValid}
              >
                Thêm
              </Button>
            ]}
          >
            <Row align="middle" gutter={16}>
              <Col className="gutter-row" span={6}>
                <Text>Tên</Text>
              </Col>
              <Col
                style={{ display: 'flex', flexDirection: 'column' }}
                className="gutter-row"
                span={18}
              >
                <Input
                  onChange={handleChange('fullname')}
                  placeholder="Nguyễn Văn A"
                  value={values.fullname}
                  onKeyPress={event => handleKeyPress(event, isValid, values)}
                />
                {errors.fullname && (
                  <Text style={{ color: 'red' }}>{errors.fullname}</Text>
                )}
              </Col>
            </Row>
            <Row align="middle" gutter={16} style={{ marginTop: 16 }}>
              <Col className="gutter-row" span={6}>
                <Text>Email</Text>
              </Col>
              <Col
                style={{ display: 'flex', flexDirection: 'column' }}
                className="gutter-row"
                span={18}
              >
                <Input
                  onChange={handleChange('email')}
                  placeholder="nguyenvana@gmail.com"
                  value={values.email}
                  type="email"
                  onKeyPress={event => handleKeyPress(event, isValid, values)}
                />
                {errors.email && (
                  <Text style={{ color: 'red' }}>{errors.email}</Text>
                )}
              </Col>
            </Row>
            <Row align="middle" gutter={16} style={{ marginTop: 16 }}>
              <Col className="gutter-row" span={6}>
                <Text>SĐT</Text>
              </Col>
              <Col
                style={{ display: 'flex', flexDirection: 'column' }}
                className="gutter-row"
                span={18}
              >
                <Input
                  onChange={handleChange('phoneNumber')}
                  placeholder="076XXXXXX"
                  value={values.phoneNumber}
                  type="tel"
                  onKeyPress={event => handleKeyPress(event, isValid, values)}
                />
                {errors.phoneNumber && (
                  <Text style={{ color: 'red' }}>{errors.phoneNumber}</Text>
                )}
              </Col>
            </Row>
          </Modal>
        )
      }}
    </Formik>
  )
}
