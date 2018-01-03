// pages/schedule/schedule.js

// import * as ScheduleDataService from '../../services/schedule-data-service';
import * as HotelDataService from '../../services/hotel-service';

'use strict';
let choose_year = null,
	choose_month = null;
const conf = {
	data: {
    hallId: 0,
    bodyhidden: true,
		hasEmptyGrid: false,
		showPicker: false,
    preStrHidden: true,
    nextStrHidden: false,
    newDays: '',

    // 联系人 方式
    contacts: {
      contact: '',
      contactInformation: '',
      gender: '女士'
    },
    // 性别
    genderItems: [
      { name: '女士', value: '女士', checked: 'true' },
      { name: '先生', value: '先生' },
    ],
    // 桌数
    ballInfo: {}
	},
	onLoad (option) {

    this.setData({
      hallId: option.hallid,
      ballInfo: option.ballinfo
    })

    console.log('ballinfo = ' + JSON.stringify(option.ballinfo));

    // 档期查询
    this.initDataOnCalendar();

	},
  // 初始化 日历
  initDataOnCalendar () {
    const date = new Date();
    const cur_year = date.getFullYear();
    const cur_month = date.getMonth() + 1;
    const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
    this.calculateEmptyGrids(cur_year, cur_month);

    this.getOldCalendarLuckydays(cur_year, cur_month);

    var start_date = cur_year + '-' + cur_month + '-' + date.getDate();
    var now_month = cur_month;

    this.setData({
      cur_year,
      cur_month,
      weeks_ch,
      start_date,
      now_month
    });
  },
  // 获取 月份 天数
	getThisMonthDays(year, month) {
		return new Date(year, month, 0).getDate();
	},
  // 获取 1 号 是周几
	getFirstDayOfWeek(year, month) {
		return new Date(Date.UTC(year, month - 1, 1)).getDay();
	},
  // 获取年月 前后 空格 数
	calculateEmptyGrids(year, month) {
		const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
		let empytGrids = [];
		if (firstDayOfWeek > 0) {
			for (let i = 0; i < firstDayOfWeek; i++) {
				empytGrids.push(i);
			}
			this.setData({
				hasEmptyGrid: true,
				empytGrids
			});
		} else {
			this.setData({
				hasEmptyGrid: false,
				empytGrids: []
			});
		}
	},
  // 设置 年月日
  calculateDays(year, month, luckydays) {
		let days = [];
    const date = new Date();
		const thisMonthDays = this.getThisMonthDays(year, month);
    var dayStr = date.getDate();
    var reserved = false;

		for (let i = 1; i <= thisMonthDays; i++) {
      var choosed = false;
      var lunar = '';
      if (i == dayStr && month == date.getMonth()+1 && year == date.getFullYear()) {
        choosed = true;
        this.setData({
          oldChooseDayIndex: i-1
        })
      }

      if (luckydays[i - 1].goodFlag == true) {
        lunar = '吉日';
      }
      
      reserved = luckydays[i - 1].reservedFlag;
      // 今天以前不可选 变灰
      if (i <= dayStr && month <= date.getMonth() + 1 && year <= date.getFullYear()) {
        reserved = true;
      }

      days.push({
        day: i,
        choosed: choosed,
        lunar: lunar,
        reserved: reserved
      });

		}

		this.setData({
			days
		});
	},
  // 遍历吉日 获取老黄历
  getOldCalendarLuckydays(year, month) {
    
    var me = this;
    HotelDataService.queryScheduleList(year, month, me.data.hallId).then((result) => {

      me.calculateDays(year, month, result);

      me.setData({
        bodyhidden: false
      })

    }).catch(() => {
      console.log('fails');
    })
  },
  // 点击 前一个月 后一个月
	handleCalendar(e) {
		var handle = e.currentTarget.dataset.handle;
		var cur_year = this.data.cur_year;
		var cur_month = this.data.cur_month;

    console.log('当前月份 = ' + this.data.cur_month);
    console.log('真实月份 = ' + this.data.now_month);

		if (handle === 'prev') {

      if (cur_month == this.data.now_month) {
        console.log('不可往后预约 ');
        this.setData({
          preStrHidden: true
        });
      } else {
        let newMonth = cur_month - 1;
        let newYear = cur_year;
        if (newMonth < 1) {
          newYear = cur_year - 1;
          newMonth = 12;
        }
        console.log('-1 ');

        this.getOldCalendarLuckydays(newYear, newMonth);
        this.calculateEmptyGrids(newYear, newMonth);

        this.setData({
          cur_year: newYear,
          cur_month: newMonth
        });
      }

		} else {
      
      let newMonth = cur_month + 1;
      let newYear = cur_year;
      if (newMonth > 12) {
        newYear = cur_year + 1;
        newMonth = 1;
      }
      console.log('+1 ');
      this.getOldCalendarLuckydays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);

      this.setData({
        preStrHidden: false,
        cur_year: newYear,
        cur_month: newMonth
      });

    }
		
	},
  // 点击某一天
	tapDayItem(e) {
		const idx = e.currentTarget.dataset.idx;
		const days = this.data.days;
    var oldChooseDayIndex = this.data.oldChooseDayIndex;

    // 判断 是否 可预定 
    if (!days[idx].reserved) {

      days[oldChooseDayIndex].choosed = false;
      days[idx].choosed = true;

      this.setData({
        days,
        oldChooseDayIndex: idx,
        newDays: this.data.cur_year + '-' + this.data.cur_month + '-' + (idx + 1)
      });
    }

	},
  // 选择年月
	chooseYearAndMonth() {
		const cur_year = this.data.cur_year;
		const cur_month = this.data.cur_month;
		let picker_year = [],
			picker_month = [];
		for (let i = 1900; i <= 2100; i++) {
			picker_year.push(i);
		}
		for (let i = 1; i <= 12; i++) {
			picker_month.push(i);
		}
		const idx_year = picker_year.indexOf(cur_year);
		const idx_month = picker_month.indexOf(cur_month);
		this.setData({
			picker_value: [ idx_year, idx_month ],
			picker_year,
			picker_month,
			showPicker: true,
		});
	},
  // 选择年月 滚轮
	pickerChange(e) {
		const val = e.detail.value;

    choose_year = val.split("-")[0];
    choose_month = val.split("-")[1];

    this.calculateEmptyGrids(choose_year, choose_month);
    this.getOldCalendarLuckydays(choose_year, choose_month);

    this.setData({
      cur_year: choose_year,
      cur_month: choose_month
    });

	},

  // 立即预约
  bindConfirmBtnTap () {

    //保存桌数
    // if (this.data.ballInfo.tabNumsText) {
    //   wx.setStorageSync('ballTablenNum', this.data.ballInfo.tabNumsText);
    // }
    
    // // 保存联系人 信息
    // wx.setStorageSync('contacts', this.data.contacts);
    // // 保存预订 日期
    // wx.setStorageSync('reservedDate', this.data.newDays);

    console.log('newDays = ' + this.data.newDays);
    console.log('contacts = ' + JSON.stringify(this.data.contacts));
    console.log('ballTablenNum = ' + this.data.ballInfo.tabNumsText);


  },

  // 联系人信息 获取
  bindContactInput(e) {
    this.setData({
      'contacts.contact': e.detail.value
    })
  },
  bindContactInfoInput(e) {
    this.setData({
      'contacts.contactInformation': e.detail.value
    })
  },
  bindGenderCheckboxChange(e) {
    this.setData({
      'contacts.gender': e.detail.value
    })
  },
  bindTableSliderChange(e) {
    this.setData({
      'ballInfo.tabNumsText': e.detail.value
    })
  },

};

Page(conf);