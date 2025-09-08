import { renderHook, act } from '@testing-library/react'
import { useFormikWithReset, useFormState } from '../useForm'
import type { FormikConfig } from 'formik'

interface TestFormValues {
    name: string
    email: string
    age: number
}

describe('useForm hooks', () => {
    describe('useFormikWithReset', () => {
        const initialValues: TestFormValues = {
            name: '',
            email: '',
            age: 0
        }

        const formikConfig: FormikConfig<TestFormValues> = {
            initialValues,
            onSubmit: jest.fn(),
            validate: (values) => {
                const errors: any = {}
                if (!values.name) errors.name = 'Name is required'
                if (!values.email) errors.email = 'Email is required'
                if (values.age < 0) errors.age = 'Age must be positive'
                return errors
            }
        }

        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should initialize with initial values', () => {
            const { result } = renderHook(() => useFormikWithReset(formikConfig))

            expect(result.current.values).toEqual(initialValues)
            expect(result.current.isDirty).toBe(false)
        })

        it('should track dirty state when values change', () => {
            const { result } = renderHook(() => useFormikWithReset(formikConfig))

            expect(result.current.isDirty).toBe(false)

            act(() => {
                result.current.setFieldValue('name', 'John Doe')
            })

            expect(result.current.isDirty).toBe(true)
        })

        it('should reset form to initial values', () => {
            const { result } = renderHook(() => useFormikWithReset(formikConfig))

            act(() => {
                result.current.setFieldValue('name', 'John Doe')
                result.current.setFieldValue('email', 'john@example.com')
                result.current.setFieldValue('age', 25)
            })

            expect(result.current.isDirty).toBe(true)

            act(() => {
                result.current.resetForm()
            })

            expect(result.current.values).toEqual(initialValues)
            expect(result.current.isDirty).toBe(false)
        })

        it('should maintain formik functionality', () => {
            const { result } = renderHook(() => useFormikWithReset(formikConfig))

            // Test that all formik properties are available
            expect(result.current.handleSubmit).toBeDefined()
            expect(result.current.handleChange).toBeDefined()
            expect(result.current.handleBlur).toBeDefined()
            expect(result.current.setFieldValue).toBeDefined()
            expect(result.current.setFieldError).toBeDefined()
            expect(result.current.setFieldTouched).toBeDefined()
            expect(result.current.validateForm).toBeDefined()
            expect(result.current.submitForm).toBeDefined()
        })

        it('should validate form correctly', async () => {
            const { result } = renderHook(() => useFormikWithReset(formikConfig))

            await act(async () => {
                await result.current.validateForm()
            })

            expect(result.current.errors.name).toBe('Name is required')
            expect(result.current.errors.email).toBe('Email is required')
        })

        it('should handle form submission', async () => {
            const onSubmit = jest.fn()
            const config = { ...formikConfig, onSubmit }
            const { result } = renderHook(() => useFormikWithReset(config))

            act(() => {
                result.current.setFieldValue('name', 'John Doe')
                result.current.setFieldValue('email', 'john@example.com')
                result.current.setFieldValue('age', 25)
            })

            await act(async () => {
                await result.current.submitForm()
            })

            expect(onSubmit).toHaveBeenCalledWith(
                { name: 'John Doe', email: 'john@example.com', age: 25 },
                expect.any(Object)
            )
        })

        it('should not change isDirty state if reset to same values', () => {
            const customInitial = { name: 'John', email: 'john@example.com', age: 25 }
            const customConfig = { ...formikConfig, initialValues: customInitial }
            const { result } = renderHook(() => useFormikWithReset(customConfig))

            expect(result.current.isDirty).toBe(false)

            act(() => {
                result.current.setFieldValue('name', 'John')
            })

            expect(result.current.isDirty).toBe(false)
        })
    })

    describe('useFormState', () => {
        const initialValues = {
            name: '',
            email: '',
            age: 0
        }

        const validate = (values: typeof initialValues) => {
            const errors: Record<string, string> = {}
            if (!values.name) errors.name = 'Name is required'
            if (!values.email.includes('@')) errors.email = 'Invalid email'
            if (values.age < 18) errors.age = 'Must be 18 or older'
            return errors
        }

        it('should initialize with initial values', () => {
            const { result } = renderHook(() => useFormState(initialValues, validate))

            expect(result.current.values).toEqual(initialValues)
            expect(result.current.errors).toEqual({
                name: 'Name is required',
                email: 'Invalid email',
                age: 'Must be 18 or older'
            })
            expect(result.current.isValid).toBe(false)
            expect(result.current.isDirty).toBe(false)
        })

        it('should update field values', () => {
            const { result } = renderHook(() => useFormState(initialValues, validate))

            act(() => {
                result.current.setFieldValue('name', 'John Doe')
            })

            expect(result.current.values.name).toBe('John Doe')
            expect(result.current.isDirty).toBe(true)
        })

        it('should clear error when field is updated', () => {
            const { result } = renderHook(() => useFormState(initialValues, validate))

            expect(result.current.errors.name).toBe('Name is required')

            act(() => {
                result.current.setFieldValue('name', 'John Doe')
            })

            expect(result.current.errors.name).toBeUndefined()
        })

        it('should set field errors manually', () => {
            const { result } = renderHook(() => useFormState(initialValues, validate))

            act(() => {
                result.current.setFieldError('name', 'Custom error')
            })

            expect(result.current.errors.name).toBe('Custom error')
        })

        it('should set field touched state', () => {
            const { result } = renderHook(() => useFormState(initialValues, validate))

            expect(result.current.touched.name).toBeFalsy()

            act(() => {
                result.current.setFieldTouched('name', true)
            })

            expect(result.current.touched.name).toBe(true)
        })

        it('should validate form manually', () => {
            const { result } = renderHook(() => useFormState(initialValues, validate))

            let validationResult: Record<string, string> = {}
            act(() => {
                validationResult = result.current.validateForm()
            })

            expect(validationResult).toEqual({
                name: 'Name is required',
                email: 'Invalid email',
                age: 'Must be 18 or older'
            })
            expect(result.current.errors).toEqual(validationResult)
        })

        it('should reset form to initial state', () => {
            const { result } = renderHook(() => useFormState(initialValues, validate))

            act(() => {
                result.current.setFieldValue('name', 'John Doe')
                result.current.setFieldValue('email', 'john@example.com')
                result.current.setFieldTouched('name', true)
                result.current.setFieldError('custom', 'Custom error')
            })

            expect(result.current.isDirty).toBe(true)

            act(() => {
                result.current.resetForm()
            })

            expect(result.current.values).toEqual(initialValues)
            expect(result.current.errors).toEqual({})
            expect(result.current.touched).toEqual({})
            expect(result.current.isDirty).toBe(false)
        })

        it('should be valid when no errors exist', () => {
            const { result } = renderHook(() => useFormState(initialValues, validate))

            act(() => {
                result.current.setFieldValue('name', 'John Doe')
                result.current.setFieldValue('email', 'john@example.com')
                result.current.setFieldValue('age', 25)
            })

            expect(result.current.isValid).toBe(true)
        })

        it('should work without validation function', () => {
            const { result } = renderHook(() => useFormState(initialValues))

            expect(result.current.errors).toEqual({})
            expect(result.current.isValid).toBe(true)

            let validationResult: Record<string, string>
            act(() => {
                validationResult = result.current.validateForm()
            })
            expect(validationResult!).toEqual({})
        })

        it('should track dirty state correctly', () => {
            const customInitial = { name: 'John', email: 'john@example.com', age: 25 }
            const { result } = renderHook(() => useFormState(customInitial, validate))

            expect(result.current.isDirty).toBe(false)

            act(() => {
                result.current.setFieldValue('name', 'Jane')
            })

            expect(result.current.isDirty).toBe(true)

            act(() => {
                result.current.setFieldValue('name', 'John')
            })

            expect(result.current.isDirty).toBe(false)
        })

        it('should handle complex nested objects', () => {
            const nestedInitial = {
                user: {
                    name: '',
                    profile: {
                        age: 0,
                        email: ''
                    }
                }
            }

            const { result } = renderHook(() => useFormState(nestedInitial))

            act(() => {
                result.current.setFieldValue('user', {
                    name: 'John',
                    profile: { age: 25, email: 'john@example.com' }
                })
            })

            expect(result.current.values.user.name).toBe('John')
            expect(result.current.values.user.profile.age).toBe(25)
            expect(result.current.isDirty).toBe(true)
        })
    })
})
