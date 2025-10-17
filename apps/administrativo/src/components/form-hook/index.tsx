import { FormAsyncSelect } from './AsyncSelect'
import { FormDateInput } from './DateInput'
import { FormDateTimeInput } from './DateTimeInput'
import { FormDecimalInput } from './DecimalInput'
import { FormDurationInput } from './DurationInput'
import { FormErrorMessage } from './ErrorMessage'
import { FormField } from './Field'
import { FormFileInput } from './FileInput'
import { FormIcon } from './Icon'
import { FormIconContainer } from './IconContainer'
import { FormInput } from './Input'
import { FormInputLoading } from './InputLoading'
import { FormLabel } from './Label'
import { FormMaskInput } from './MaskInput'
import { FormMultiSelect } from './MultiSelect'
import { FormSelect } from './Select'
import { FormSelectSearchable } from './SelectSearchable'
import { FormSwitch } from './Switch'
import { FormTextArea } from './TextArea'
import { FormTree } from './Tree'

export const Form = {
  Label: FormLabel,
  Field: FormField,
  DurationInput: FormDurationInput,
  Icon: FormIcon,
  IconContainer: FormIconContainer,
  Input: FormInput,
  InputLoading: FormInputLoading,
  FileInput: FormFileInput,
  Select: FormSelect,
  AsyncSelect: FormAsyncSelect,
  MultiSelect: FormMultiSelect,
  DateInput: FormDateInput,
  DateTimeInput: FormDateTimeInput,
  DecimalInput: FormDecimalInput,
  MaskInput: FormMaskInput,
  Tree: FormTree,
  TextArea: FormTextArea,
  Switch: FormSwitch,
  ErrorMessage: FormErrorMessage,
  SelectSearchable: FormSelectSearchable,
}
