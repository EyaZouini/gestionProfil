import { View, Text } from 'react-native'
import React from 'react'

export default function Chat(props) {

    const secondnom = props.route.params.secondnom;
  return (
    <View>
      <Text>Chat + {secondnom}</Text>
    </View>
  )
}