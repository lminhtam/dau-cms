import { Button, Modal, Typography } from 'antd'
import React from 'react'
import { MODAL_TYPE } from 'ultis/functions'

const { Text } = Typography

export default class GlobalModal extends React.Component {
  static instance = null

  constructor(props) {
    super(props)
    GlobalModal.instance = this
    this.state = {
      isShow: false,
      title: '',
      content: '',
      type: MODAL_TYPE.NORMAL,
      onPress: () => {}
    }
  }

  static alertMessage = (
    iTitle = 'Thông báo',
    iContent = 'Đã xảy ra lỗi',
    iType = MODAL_TYPE.NORMAL,
    onPress = () => {}
  ) => {
    GlobalModal.instance.setState({
      isShow: true,
      title: iTitle,
      content: iContent,
      type: iType,
      onPress
    })
  }

  closeModal = () => {
    GlobalModal.instance.setState({ isShow: false })
  }

  handleOk = () => {
    GlobalModal.instance.state.onPress()
    GlobalModal.instance.closeModal()
  }

  handleCancel = () => {
    GlobalModal.instance.closeModal()
  }

  render() {
    return (
      <Modal
        title={GlobalModal.instance.state.title}
        visible={GlobalModal.instance.state.isShow}
        centered
        onOk={GlobalModal.instance.handleOk}
        onCancel={GlobalModal.instance.handleCancel}
        footer={
          GlobalModal.instance.state.type === MODAL_TYPE.NORMAL
            ? [
                <Button
                  key="okButton"
                  type="primary"
                  onClick={GlobalModal.instance.handleOk}
                  size="large"
                >
                  OK
                </Button>
              ]
            : [
                <Button
                  key="cancelButton"
                  onClick={GlobalModal.instance.handleCancel}
                  size="large"
                >
                  Hủy
                </Button>,
                <Button
                  key="okButton"
                  size="large"
                  type="primary"
                  onClick={GlobalModal.instance.handleOk}
                >
                  OK
                </Button>
              ]
        }
      >
        <Text>{GlobalModal.instance.state.content}</Text>
      </Modal>
    )
  }
}
