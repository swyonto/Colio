import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface ColioLogoProps {
  size?: number;
  borderRadius?: number;
}

const logoAsset = require('../../../assets/logo.png');

export const ColioLogo: React.FC<ColioLogoProps> = ({ size = 36, borderRadius }) => {
  const radius = borderRadius !== undefined ? borderRadius : Math.round(size * 0.22);

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: radius }]}>
      <Image
        source={logoAsset}
        style={[styles.image, { width: size, height: size, borderRadius: radius }]}
        resizeMode="contain"
      />
    </View>
  );
};

export const CalioLogo = ColioLogo;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
