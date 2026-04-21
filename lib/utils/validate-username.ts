export type UsernameValidationResult =
  | { status: 'skip' }         // не нужна проверка (нет профиля или то же имя)
  | { status: 'error'; message: string }  // ошибка формата
  | { status: 'check_db' }     // формат ок — нужна проверка в БД

/**
 * Чистая синхронная часть логики checkUsername.
 * Возвращает skip/error/check_db — без сайд-эффектов.
 */
export function validateUsernameFormat(
  value: string,
  currentUsername: string | null | undefined,
  locale: 'ru' | 'en' = 'ru',
): UsernameValidationResult {
  if (!currentUsername || value === currentUsername) {
    return { status: 'skip' }
  }
  if (value.length < 3) {
    return {
      status: 'error',
      message: locale === 'ru' ? 'Минимум 3 символа' : 'Minimum 3 characters',
    }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    return {
      status: 'error',
      message: locale === 'ru' ? 'Только буквы, цифры и _' : 'Only letters, numbers and _',
    }
  }
  return { status: 'check_db' }
}
