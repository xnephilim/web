import { Center, Circle, Spinner } from '@chakra-ui/react'
import { isFirejinx } from 'react-device-detect'
import Orbs from 'assets/orbs.svg'
import OrbsStatic from 'assets/orbs-static.png'
import { JinxIcon } from 'components/Icons/JinxIcon'
import { Page } from 'components/Layout/Page'
import { colors } from 'theme/colors'

export const SplashScreen = () => {
  return (
    <Page>
      <Center
        flexDir='column'
        height='100vh'
        backgroundImage={colors.altBg}
        px={6}
        _after={{
          position: 'absolute',
          content: '""',
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${isFirejinx ? OrbsStatic : Orbs})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      >
        <Circle size='100px' mb={6}>
          <JinxIcon boxSize='100%' color='white' />
        </Circle>
        <Spinner />
      </Center>
    </Page>
  )
}
