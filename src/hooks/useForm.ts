import { useState, useCallback, useEffect } from 'react';
import { FormikProps, useFormik, FormikConfig } from 'formik';

export interface UseFormikWithResetReturn<T> extends FormikProps<T> {
    resetForm: () => void;
    isDirty: boolean;
}

export function useFormikWithReset<T>(
    config: FormikConfig<T>
): UseFormikWithResetReturn<T> {
    const [initialValues] = useState(config.initialValues);

    const formik = useFormik({
        ...config,
        initialValues,
    });

    const resetForm = useCallback(() => {
        formik.resetForm({ values: initialValues });
    }, [formik, initialValues]);

    const isDirty = JSON.stringify(formik.values) !== JSON.stringify(initialValues);

    return {
        ...formik,
        resetForm,
        isDirty,
    };
}

export interface UseFormStateReturn<T> {
    values: T;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isValid: boolean;
    isDirty: boolean;
    setFieldValue: (field: string, value: any) => void;
    setFieldError: (field: string, error: string) => void;
    setFieldTouched: (field: string, touched: boolean) => void;
    resetForm: () => void;
    validateForm: () => Record<string, string>;
}

export function useFormState<T extends Record<string, any>>(
    initialValues: T,
    validate?: (values: T) => Record<string, string>
): UseFormStateReturn<T> {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [initialState] = useState(initialValues);
    const [shouldValidate, setShouldValidate] = useState(true);

    // Run validation on initialization and when values change
    useEffect(() => {
        if (validate && shouldValidate) {
            const validationErrors = validate(values);
            setErrors(validationErrors);
        }
    }, [values, validate, shouldValidate]);

    const validateForm = useCallback((): Record<string, string> => {
        if (!validate) return {};
        const validationErrors = validate(values);
        setErrors(validationErrors);
        return validationErrors;
    }, [values, validate]);

    const setFieldValue = useCallback((field: string, value: any) => {
        setValues(prev => ({ ...prev, [field]: value }));
        setShouldValidate(true);
        // Clear error when field is updated - let useEffect handle validation
    }, []);

    const setFieldError = useCallback((field: string, error: string) => {
        setErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    const setFieldTouched = useCallback((field: string, touchedValue: boolean) => {
        setTouched(prev => ({ ...prev, [field]: touchedValue }));
    }, []);

    const resetForm = useCallback(() => {
        setValues(initialState);
        setErrors({});
        setTouched({});
        setShouldValidate(false);
        // Don't run validation immediately after reset
    }, [initialState]);

    const isValid = Object.keys(errors).length === 0;
    const isDirty = JSON.stringify(values) !== JSON.stringify(initialState);

    return {
        values,
        errors,
        touched,
        isValid,
        isDirty,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        resetForm,
        validateForm,
    };
}
