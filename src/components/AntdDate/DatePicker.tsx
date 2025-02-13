import 'antd/es/date-picker/style/index';

import generatePicker from 'antd/es/date-picker/generatePicker';
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';

const DatePicker = generatePicker(dayjsGenerateConfig);

export default DatePicker;
