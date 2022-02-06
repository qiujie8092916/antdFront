import 'antd/es/calendar/style';

import generateCalendar from 'antd/es/calendar/generateCalendar';
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';

const Calendar = generateCalendar(dayjsGenerateConfig);

export default Calendar;
