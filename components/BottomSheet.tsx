import {Dimensions, StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useEffect, useImperativeHandle} from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

//Access the screen size dimensions
const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50; // this will control the space above where the sheet will stop when dragging gesture

type BottomSheetProps = {
  children?: React.ReactNode;
};
export type BottomSheetRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
};

//BottomSheet component
const BottomSheet = React.forwardRef<BottomSheetRefProps, BottomSheetProps>(
  ({children}, ref) => {
    const translateY = useSharedValue(0); // This variable will hold the gesture values that is able to read by the gesture.pan event
    const active = useSharedValue(false);
    const scrollTo = useCallback((destination: number) => {
      'worklet';
      active.value = destination !== 0;
      translateY.value = withSpring(destination, {damping: 50});
    }, []);

    const isActive = useCallback(() => {
      return active.value;
    }, []);

    useImperativeHandle(ref, () => ({scrollTo, isActive}), [
      scrollTo,
      isActive,
    ]);
    const context = useSharedValue({y: 0});
    //this the gesture event
    const gesture = Gesture.Pan()
      .onStart(() => {
        context.value = {y: translateY.value};
      })
      .onUpdate(event => {
        translateY.value = event.translationY + context.value.y; // context.value.y holds the previous on start value of the translateY.value this will make snap accordingly
        translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y); // this will help in clamping
      })
      .onEnd(event => {
        if (translateY.value > -SCREEN_HEIGHT / 3) {
          scrollTo(0);
        } else if (translateY.value < -SCREEN_HEIGHT / 1.5) {
          scrollTo(MAX_TRANSLATE_Y);
        }
      });
    // useEffect(() => {
    //   scrollTo(-SCREEN_HEIGHT / 3); // by dividing the value to a number it will be the position.
    //   //Added the damping to reduce the bouncing effect of spring
    // }, []);

    //A bottom style that is animated with the translateY values
    const rBottomSheetStyle = useAnimatedStyle(() => {
      //When the translateY value reach the MAX_TRANSLATE_Y + 50 the borderRadius needs to be 25 otherwise when
      //the translateY value reach the MAX_TRANSLATE_Y the borderRadius needs to be 5
      const borderRadius = interpolate(
        translateY.value,
        [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
        [25, 5],
        Extrapolate.CLAMP,
      );
      return {
        borderRadius,
        transform: [{translateY: translateY.value}],
      };
    });
    return (
      //to use the pan gesture use the gesture detector component and wrap the child
      <GestureDetector gesture={gesture}>
        {/*assign the gesture detector the gesture parameter*/}
        {/* To handle the gesture detector add the animated.view*/}
        <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
          <View style={styles.line} />
          {children}
        </Animated.View>
      </GestureDetector>
    );
  },
);

export default BottomSheet;

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: 'white',
    //to push down the bottomsheet equal to height will not be visible
    //by setting position: absolute and top: SCREEN_HEIGHT
    position: 'absolute',
    top: SCREEN_HEIGHT,
    borderRadius: 25,
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: 'grey',
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 2,
  },
});
