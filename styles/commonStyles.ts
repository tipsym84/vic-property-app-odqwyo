
import { StyleSheet } from 'react-native';

export const colors = {
  background: '#f9f9f9',
  text: '#212121',
  textSecondary: '#757575',
  primary: '#3f51b5',
  secondary: '#f44336',
  accent: '#ffca28',
  card: '#ffffff',
  highlight: '#e8eaf6',
  border: '#e0e0e0',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'CourierPrime_400Regular',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'CourierPrime_700Bold',
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    fontFamily: 'CourierPrime_400Regular',
  },
  textSecondary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontFamily: 'CourierPrime_400Regular',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'CourierPrime_700Bold',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginVertical: 8,
    fontFamily: 'CourierPrime_400Regular',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'CourierPrime_700Bold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
});
