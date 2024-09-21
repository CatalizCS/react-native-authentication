import React from 'react';
import { View, TextInput as RNTextInput, StyleSheet, Text, TextInputProps } from 'react-native';
import { Colors } from '@/config/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomTextInputProps extends TextInputProps {
    label?: string;
    leftIconName?: keyof typeof MaterialIcons.glyphMap;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
    label,
    leftIconName,
    ...otherProps
}) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                {leftIconName && <MaterialIcons name={leftIconName} size={24} color={Colors.primary} />}
                <RNTextInput
                    style={styles.input}
                    placeholderTextColor={Colors.gray}
                    autoCapitalize="none"
                    {...otherProps}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    label: {
        fontSize: 14,
        color: Colors.black,
        marginBottom: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.lightGray,
        borderRadius: 8,
        padding: 10,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: Colors.black,
    },
});

export default CustomTextInput;
