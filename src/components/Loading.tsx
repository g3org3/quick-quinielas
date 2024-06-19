import { Flex, Progress } from '@chakra-ui/react'

export default function Loading() {
  return (
    <Flex flexDir="column" justifyContent="center" flex="1">
      <center>
        <h1 style={{ fontWeight: 'bold' }}>Loading...</h1>
      </center>
      <Progress size='xs' isIndeterminate />
    </Flex>
  )
}
