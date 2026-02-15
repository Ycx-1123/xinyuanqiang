<template>
  <view class="page">
    <view class="page-header">
      <view class="page-title-row">
        <text class="icon">🏮</text>
        <text>多民族节日 · 习俗文化</text>
      </view>
      <text class="page-title">民族习俗图鉴</text>
      <text class="page-subtitle">按日期探索不同民族的节日智慧</text>
    </view>

    <view class="content">
      <view class="panel">
        <view class="panel-header">
          <view class="panel-title">
            <text>习俗日历</text>
            <text class="panel-title-pill">按日期发现节日</text>
          </view>
        </view>

        <text class="panel-desc">
          支持农历与公历的节日换算。橙色点为民族节日，绿色点为二十四节气（多民族共庆）。点击带点的日期或下方标签，可查看详细习俗内容。
        </text>

        <view class="month-bar">
          <view class="month-arrow-btn" @tap="changeMonth(-1)">‹</view>
          <text class="month-main">{{ currentYear }}年 {{ currentMonth + 1 }}月</text>
          <view class="month-arrow-btn" @tap="changeMonth(1)">›</view>
        </view>

        <view class="calendar-grid">
          <view
            v-for="w in weeks"
            :key="w"
            class="calendar-header-cell"
          >
            <text>{{ w }}</text>
          </view>

          <view
            v-for="(cell, index) in calendarCells"
            :key="index"
            class="calendar-cell"
            :class="{
              empty: !cell.day,
              'has-festival': cell.day && cell.festivals.length > 0 && !cell.festivals.some(isFestivalSolarTerm),
              'has-solar-term': cell.day && cell.festivals.some(isFestivalSolarTerm),
              active: cell.day && cell.day === activeDay
            }"
            @tap="cell.day && cell.festivals.length > 0 && onDayTap(cell)"
          >
            <text v-if="cell.day">{{ cell.day }}</text>
          </view>
        </view>

        <view class="panel-hint">
          <text class="panel-hint-badge">提示</text>
          <view class="panel-hint-legends">
            <view class="panel-hint-legend">
              <view class="legend-dot legend-dot-festival" />
              <text>节日</text>
            </view>
            <view class="panel-hint-legend">
              <view class="legend-dot legend-dot-solar" />
              <text>节气</text>
            </view>
          </view>
        </view>

        <view class="festival-list">
          <view
            v-for="f in monthFestivals"
            :key="f.id"
            class="festival-chip"
            :class="{
              'festival-chip-solar': f.isSolarTerm,
              active:
                activeDay === f.date.getDate() &&
                selectedFestival &&
                selectedFestival.name === f.name
            }"
            @tap="onFestivalChipTap(f)"
          >
            <view class="festival-chip-dot" :class="{ 'chip-dot-solar': f.isSolarTerm }" />
            <text>{{ f.date.getDate() }}日 · {{ f.name }}</text>
          </view>
        </view>
      </view>

      <view class="detail-panel" id="detailContainer">
        <view v-if="!selectedFestival" class="detail-inner">
          <view class="empty-state">
            <text class="empty-state-icon">📅</text>
            <text class="empty-state-title">请选择一个节日</text>
            <text class="empty-state-desc">
              在日历中点击带橙色点（节日）或绿色点（节气）的日期，或直接点选下方标签，即可查看详细习俗内容。
            </text>
          </view>
        </view>

        <view v-else class="detail-inner" :class="{ 'detail-inner-solar': selectedFestival.isSolarTerm }">
          <view class="detail-tag-row">
            <text class="detail-tag-label">{{ selectedFestival.isSolarTerm ? '参与范围：' : '参与民族：' }}</text>
            <view
              v-for="(eth, idx) in selectedFestivalEthnics"
              :key="idx"
              class="detail-tag"
              :class="{ 'detail-tag-solar': selectedFestival.isSolarTerm }"
            >
              <text>{{ eth }}</text>
            </view>
          </view>

          <view class="detail-festival-name">
            <text class="icon">{{ selectedFestival.isSolarTerm ? '🌿' : '✨' }}</text>
            <text>{{ selectedFestival.name }}</text>
            <view v-if="selectedFestival.isSolarTerm" class="detail-badge-solar">节气</view>
          </view>

          <view class="detail-meta-row">
            <view class="detail-meta-item">
              <text class="detail-meta-label">时间</text>
              <text>
                {{ currentYear }}年{{ selectedFestival.date.getMonth() + 1 }}月{{ selectedFestival.date.getDate() }}日
              </text>
            </view>
            <view class="detail-meta-item">
              <text class="detail-meta-label">农历 / 规则</text>
              <text>{{ selectedFestival.originalDate }}</text>
            </view>
          </view>

          <scroll-view scroll-y class="detail-body">
            <view v-if="selectedFestival.mergedList && selectedFestival.mergedList.length">
              <view
                v-for="(seg, idx) in selectedFestival.mergedList"
                :key="idx"
                class="detail-desc-seg"
              >
                <text class="detail-desc-ethnic">{{ seg.ethnic }}：</text>
                <text class="detail-desc-text">{{ seg.desc }}</text>
              </view>
            </view>
            <view v-else>
              <text>{{ selectedFestival.desc }}</text>
            </view>
          </scroll-view>

          <view class="detail-footer">
            <view class="detail-footer-left">
              <view class="detail-dot" />
              <text>节日信息仅作民俗文化展示使用。</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Lunar, Solar } from 'lunar-javascript'

type RawTuple = [string, string, string, string]

interface Festival {
  id: string
  date: Date
  ethnic: string
  name: string
  desc: string
  originalDate: string
  originalEthnic?: string
  isMerged?: boolean
  mergedList?: { ethnic: string; desc: string }[]
  isSolarTerm?: boolean
}

const RAW_DATA: RawTuple[] = [
  ['汉族', '春节', '农历正月初一', '贴春联、守岁、拜年、吃年夜饭，中华民族最隆重传统节日，新疆各族群众融合本民族特色共庆新春'],
  ['汉族', '元宵节', '农历正月十五', '吃元宵、赏花灯、猜灯谜，新疆各地举办社火、灯展等民俗活动，各族欢聚'],
  ['汉族', '端午节', '农历五月初五', '吃粽子、挂艾草、佩香囊，新疆各地传承端午驱邪祈福的传统'],
  ['汉族', '中秋节', '农历八月十五', '赏月、吃月饼、赏桂花，新疆各族家庭团圆欢聚，共庆中秋'],
  ['回族', '肉孜节（开斋节）', '伊斯兰历10月1日', '封斋期满开斋，沐浴盛装到清真寺聚礼，炸馓子、油香，走亲访友互道祝福，新疆回族最隆重的节日之一'],
  ['回族', '古尔邦节（宰牲节）', '伊斯兰历12月10日', '节前游坟缅怀先人，宰牛羊献祭、家族聚餐，清真寺集体聚礼，青年载歌载舞，新疆全域各族共庆'],
  ['回族', '圣纪节', '伊斯兰历3月12日', '纪念穆罕默德诞辰与逝世，清真寺听经讲道、集体礼拜，宰牛羊设宴聚餐，按户馈赠牛羊肉和油香'],
  ['回族', '法图麦节（姑太节）', '伊斯兰历9月14日', '回族妇女专属节日，备特色饮食、聚于清真寺祈福，缅怀穆罕默德之女法图麦，新疆回族保留此传统'],
  ['满族', '春节', '农历正月初一', '贴春联、吃饺子、守岁拜年，融合新疆地域饮食特色，保留满族挂笺、祭祖、供祖宗牌位等传统'],
  ['满族', '颁金节', '公历11月13日（农历十月十三）', '满族族庆日，纪念女真改族名为满洲，聚餐、歌舞表演，传承满族民俗文化，新疆满族核心民族节日'],
  ['满族', '添仓节', '农历正月二十五', '祭仓神、煮黏高粱米饭，饭盆插秫秸小马/锄头，寓意马驮粮食、五谷丰登，新疆满族保留的北方传统'],
  ['满族', '元宵节（上元节）', '农历正月十五', '挂彩灯、吃元宵，部分地区举办满族传统体育活动，与汉族习俗融合'],
  ['满族', '走百病', '农历正月二十', '满族妇女专属节日，结伴远走、走沙滚冰，嬉戏祈福，寓意祛除百病、新年安康'],
  ['满族', '二月二龙抬头', '农历二月初二', '剃龙头、吃猪头肉，祈福风调雨顺，新疆满族保留的北方民俗'],
  ['塔塔尔族', '撒班节（犁头节）', '公历6月20-25日', '国家级非遗，塔塔尔族核心农事节日，无宗教色彩，赛马、摔跤、叼匙竞走、载歌载舞，庆祝农业丰收，新疆奇台县大泉塔塔尔乡为核心传承地'],
  ['塔塔尔族', '肉孜节（开斋节）', '伊斯兰历10月1日', '节前大扫除、制作油炸糕点，清真寺聚礼，走亲访友互赠美食，伊犁、塔城为核心庆祝地'],
  ['塔塔尔族', '古尔邦节（宰牲节）', '伊斯兰历12月10日', '宰牲畜献祭，制作塔塔尔族特色美食聚餐，清真寺礼拜，家族团聚祈福'],
  ['塔塔尔族', '登宵节', '伊斯兰历7月27日', '通宵礼拜祈祷，纪念穆罕默德登宵，塔塔尔族重要宗教传统节日'],
  ['塔塔尔族', '诺鲁孜节', '公历3月22日', '吃诺鲁孜饭、跳麦西来甫，辞旧迎新，与新疆其他民族共庆'],
  ['维吾尔族', '诺鲁孜节', '公历3月22日', '新疆区级非遗，吃诺鲁孜饭（五谷杂粮粥）、跳麦西来甫、弹都塔尔/热瓦普，辞旧迎新，新疆各族共同参与庆祝'],
  ['维吾尔族', '古尔邦节（宰牲节）', '伊斯兰历12月10日', '维吾尔族最重要传统节日，宰牲、聚餐、走亲访友，各地举办麦西来甫、木卡姆表演，新疆全域欢庆'],
  ['维吾尔族', '肉孜节（开斋节）', '伊斯兰历10月1日', '封斋期满开斋，炸馓子、烤包子、吃油香，祈福感恩，清真寺聚礼，青年载歌载舞'],
  ['维吾尔族', '木卡姆艺术节', '公历每年5月', '非传统节日，新疆特色文化节日，演唱十二木卡姆、举办民俗展演，传承维吾尔族非遗文化'],
  ['哈萨克族', '纳吾鲁孜节', '公历3月22日', '吃纳吾鲁孜饭、赛马、叼羊、姑娘追、唱黑走马，草原迎新盛会，新疆哈萨克族核心节日'],
  ['哈萨克族', '古尔邦节（宰牲节）', '伊斯兰历12月10日', '宰羊、煮手抓肉、弹冬不拉，家族团聚祈福，草原全域举办歌舞、赛马活动'],
  ['哈萨克族', '肉孜节（开斋节）', '伊斯兰历10月1日', '开斋聚餐、歌舞表演，搭配赛马、叼羊、摔跤等草原民俗活动'],
  ['哈萨克族', '阿肯阿依特斯节', '公历每年7-8月', '哈萨克族文化节日，阿肯弹唱比赛、诗歌对唱，传承哈萨克族口头文学，新疆草原特色节日'],
  ['柯尔克孜族', '诺鲁孜节', '公历3月22日', '吃诺鲁孜饭、赛马、叼羊、弹库姆孜，迎接春天，新疆柯尔克孜族核心传统节日'],
  ['柯尔克孜族', '古尔邦节（宰牲节）', '伊斯兰历12月10日', '宰牲祭祀、家族聚餐，纪念先知易卜拉欣，高原举办叼羊、马上角力等活动'],
  ['柯尔克孜族', '肉孜节（开斋节）', '伊斯兰历10月1日', '开斋祈福，制作柯尔克孜族特色美食，青年男女弹库姆孜、唱民谣'],
  ['柯尔克孜族', '玛纳斯节', '公历每年9月', '纪念柯尔克孜族史诗《玛纳斯》，举办史诗演唱、赛马、摔跤，国家级非遗文化节日'],
  ['塔吉克族', '肖贡巴哈尔节（迎春节/诺鲁孜节）', '公历3月21-23日', '帕米尔高原独有节日，无宗教色彩，撒面粉祈福、吃杂烩饭、跳鹰舞，推举“肖贡”挨家拜节，节期3天'],
  ['塔吉克族', '古尔邦节（宰牲节）', '伊斯兰历12月10日', '宰牲、聚餐、弹鹰笛、吹唢呐，高原上的团圆节，塔吉克族核心宗教节日'],
  ['塔吉克族', '肉孜节（开斋节）', '伊斯兰历10月1日', '开斋欢庆，制作塔吉克族特色糕点，青年男女跳鹰舞、唱高原民谣'],
  ['塔吉克族', '播种节', '公历3月下旬（肖贡巴哈尔节后）', '帕米尔高原农事节日，引水耕田、播种祈福，简单聚餐庆祝，塔吉克族独有民俗'],
  ['乌孜别克族', '诺鲁孜节', '公历3月22日', '吃诺鲁孜饭、跳麦西来甫、弹弹布尔，辞旧迎新，保留中亚与新疆融合的民俗特色'],
  ['乌孜别克族', '古尔邦节（宰牲节）', '伊斯兰历12月10日', '宰牲、聚餐，制作乌孜别克族特色美食如烤包子、手抓饭，走亲访友送祝福'],
  ['乌孜别克族', '肉孜节（开斋节）', '伊斯兰历10月1日', '开斋祈福，炸馓子、烤油馕，清真寺聚礼，家庭团聚欢庆'],
  ['乌孜别克族', '苏麦莱克节', '公历每年冬季', '乌孜别克族传统节日，制作特色粥品“苏麦莱克”，邻里分享、祈福安康，新疆独有民俗'],
  ['俄罗斯族', '圣诞节', '公历12月25日', '装饰圣诞树、吃俄式大餐、唱圣诞歌，传承东正教传统，伊犁、塔城为核心庆祝地'],
  ['俄罗斯族', '洗礼节', '公历1月19日', '取圣水、沐浴祈福，前往教堂做礼拜，新疆俄罗斯族独有宗教传统节日'],
  ['俄罗斯族', '谢肉节（送冬节）', '公历2月底-3月初', '烤薄饼、跳圆圈舞、烧稻草人，送别冬天迎接春天，无宗教色彩的民俗节日'],
  ['俄罗斯族', '春节', '农历正月初一', '与汉族共庆，贴春联、吃饺子，融合俄式美食与中国传统年俗'],
  ['锡伯族', '西迁节（四一八节）', '公历4月18日', '国家级非遗，锡伯族最隆重节日，纪念西迁戍边，吃萨其马、跳贝伦舞、射箭比赛、唱锡伯族民歌'],
  ['锡伯族', '抹黑节', '农历正月十六', '锡伯族独有民俗，互相抹锅底灰，祈福驱邪、消灾避疫，象征新年平安顺遂'],
  ['锡伯族', '春节', '农历正月初一', '贴春联、吃饺子、守岁拜年，保留东北与新疆融合的民俗，祭祖、挂灯笼'],
  ['锡伯族', '中秋节', '农历八月十五', '赏月、吃月饼，举办射箭、摔跤等传统体育活动，与汉族习俗融合'],
  ['锡伯族', '颁金节', '公历11月13日', '与满族共庆，聚餐、歌舞，传承锡伯族与满族同源的民族文化'],
  ['蒙古族（新疆）', '那达慕大会', '农历六月初四', '新疆草原传统盛会，赛马、摔跤、射箭、弹马头琴、唱蒙古长调，各族群众均可参与'],
  ['蒙古族（新疆）', '白节（春节）', '农历正月初一', '草原新年，吃手把肉、喝奶茶、祭火神、祭祖，向长辈敬献哈达，草原全域欢庆'],
  ['蒙古族（新疆）', '祭敖包', '农历五月十三', '堆石祈福、绕敖包三圈、献哈达、祭祀草原神灵，祈求风调雨顺、牛羊肥壮'],
  ['蒙古族（新疆）', '马奶节', '农历八月末', '草原特色节日，制作马奶酒、聚餐、赛马，庆祝马奶丰收，祈福安康'],
  ['蒙古族（新疆）', '诺鲁孜节', '公历3月22日', '与新疆其他民族共庆，吃诺鲁孜饭，草原举办小型歌舞活动'],
  ['达斡尔族', '斡包节', '公历6月8日', '新疆达斡尔族核心节日，堆斡包、绕包祈福、赛马、射箭，传承北方游牧民族民俗'],
  ['达斡尔族', '春节', '农历正月初一', '吃手把肉、喝奶茶、守岁拜年，祭祖、贴春联，融合北方游牧与新疆地域特色'],
  ['达斡尔族', '抹黑节', '农历正月十六', '互相抹锅底灰，寓意消灾避邪、新年平安，与锡伯族习俗相融'],
  ['达斡尔族', '阔德格·乌都日节', '农历正月十六', '达斡尔族传统节日，青年男女聚唱民歌、跳集体舞，祈福新年吉祥'],
  ['汉族', '立春', '公历2月3-5日', '咬春（吃春饼、春卷）、打春牛，新疆汉族保留北方咬春习俗，部分满族、锡伯族家庭同步吃春饼'],
  ['汉族', '雨水', '公历2月18-20日', '占稻色、吃龙须面，新疆南疆汉族农耕区保留占稻色祈福习俗，与维吾尔族农事民俗相融'],
  ['汉族', '惊蛰', '公历3月5-7日', '吃梨、祭白虎、打小人，新疆汉族吃梨祈福（适配新疆水果特色），满族、达斡尔族同步吃梨驱邪'],
  ['汉族', '春分', '公历3月20-22日', '竖蛋、吃春菜、放风筝，新疆各地汉族放风筝祈福，维吾尔族、哈萨克族儿童参与放风筝活动'],
  ['汉族', '清明节（清明节气）', '公历4月4-6日', '扫墓祭祖、踏青郊游，新疆各族群众缅怀先人、亲近自然，锡伯族结合西迁节前夕祭祖习俗'],
  ['汉族', '谷雨', '公历4月19-21日', '喝谷雨茶、祭仓颉、食香椿，新疆汉族喝本地奶茶替代谷雨茶，南疆农耕区祭仓颉祈福丰收'],
  ['汉族', '立夏', '公历5月5-7日', '吃立夏饭、称体重、尝新，新疆汉族吃杂粮立夏饭，融合维吾尔族手抓饭特色，满族同步尝新'],
  ['汉族', '小满', '公历5月20-22日', '祭车神、吃苦菜、抢水，新疆北疆汉族农耕区祭车神祈福，适配新疆农机耕作特色'],
  ['汉族', '芒种', '公历6月5-7日', '煮梅、安苗、送花神，新疆汉族煮酸梅汤（适配新疆梅果），南疆维吾尔族农耕区同步安苗祈福'],
  ['汉族', '夏至', '公历6月21-22日', '吃夏至面、祭神祀祖、消夏避伏，新疆汉族吃拉条子替代凉面，满族、锡伯族吃打卤面'],
  ['汉族', '小暑', '公历7月6-8日', '吃藕、晒伏姜、食新米，新疆汉族吃本地莲藕，晒伏姜配馕吃，融合新疆饮食特色'],
  ['汉族', '大暑', '公历7月22-24日', '饮伏茶、吃仙草、烧伏香，新疆汉族饮茯茶替代伏茶，吃凉皮子消暑，各族群众同步避暑'],
  ['汉族', '立秋', '公历8月7-9日', '贴秋膘、啃秋、晒秋，新疆汉族吃烤羊肉贴秋膘（适配新疆肉食特色），满族、蒙古族同步啃瓜啃秋'],
  ['汉族', '处暑', '公历8月22-24日', '吃鸭子、开渔节、放河灯，新疆汉族吃清炖鸭，北疆渔业区放河灯，锡伯族同步放河灯祈福'],
  ['汉族', '白露', '公历9月7-9日', '喝白露茶、吃龙眼、祭禹王，新疆汉族喝新疆茯茶，吃葡萄替代龙眼，适配新疆水果特色'],
  ['汉族', '秋分', '公历9月22-24日', '祭月、吃秋菜、送秋牛，新疆汉族祭月祈福，吃野苋菜，满族同步送秋牛贴画'],
  ['汉族', '寒露', '公历10月8-9日', '赏菊、吃芝麻、饮菊花酒，新疆汉族赏本地菊花，吃芝麻馕，融合维吾尔族馕食特色'],
  ['汉族', '霜降', '公历10月23-24日', '吃柿子、赏红叶、祭祖，新疆汉族吃本地柿子，赏胡杨林红叶，各族群众同步祭祖'],
  ['汉族', '立冬', '公历11月7-8日', '吃饺子、补冬、酿黄酒，新疆汉族吃羊肉饺子补冬，满族、锡伯族同步吃饺子，蒙古族喝马奶酒补冬'],
  ['汉族', '小雪', '公历11月22-23日', '腌咸菜、吃糍粑、晒鱼干，新疆汉族腌辣皮子咸菜，吃馕包糍粑，融合新疆特色'],
  ['汉族', '大雪', '公历12月6-8日', '腌肉、赏雪、喝红薯粥，新疆汉族腌马肉腊肉，赏雪滑雪，各族群众喝杂粮粥取暖'],
  ['汉族', '冬至（冬至节气）', '公历12月21-23日', '吃饺子、喝肉汤、数九，新疆南北疆均有冬至进补的民俗传统，满族、锡伯族吃酸菜饺子'],
  ['汉族', '小寒', '公历1月5-7日', '吃菜饭、喝腊八粥、探梅，新疆汉族吃抓饭版菜饭，喝杂粮腊八粥，蒙古族同步喝奶茶粥'],
  ['汉族', '大寒', '公历1月20-21日', '吃年糕、扫尘、祭灶，新疆汉族吃炸年糕，扫尘迎新年，满族、回族同步祭灶，融合各族年俗']
]

const CHINESE_NUM: Record<string, number> = {
  正: 1, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6,
  七: 7, 八: 8, 九: 9, 十: 10, 冬: 11, 腊: 12
}

const DAY_MAP: Record<string, number> = {
  初一: 1, 初二: 2, 初三: 3, 初四: 4, 初五: 5, 初六: 6, 初七: 7, 初八: 8, 初九: 9, 初十: 10,
  十一: 11, 十二: 12, 十十三: 13, 十四: 14, 十五: 15, 十六: 16, 十七: 17, 十八: 18, 十九: 19, 二十: 20,
  廿一: 21, 廿二: 22, 廿三: 23, 廿四: 24, 廿五: 25, 廿六: 26, 廿七: 27, 廿八: 28, 廿九: 29, 三十: 30
}

const JIEQI_LIST = [
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
]

function parseChineseDateStr(str: string) {
  const match = str.match(/农历(.)月(.+)/)
  if (!match) return null
  const mStr = match[1]
  const dStr = match[2]
  const m = CHINESE_NUM[mStr] || parseInt(mStr, 10)
  const d = DAY_MAP[dStr]
  if (!m || !d) return null
  return { m, d }
}

function createFestivalObj(
  solar: any,
  ethnic: string,
  name: string,
  desc: string,
  originalDate: string
): Festival {
  return {
    date: new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay()),
    ethnic,
    name,
    desc,
    originalDate,
    id: Math.random().toString(36).substr(2, 9)
  }
}

function getJieQiMapForYear(year: number) {
  const map = new Map<string, Date>()
  let d = new Date(year, 0, 1)
  while (d.getFullYear() === year) {
    const solar = Solar.fromYmd(d.getFullYear(), d.getMonth() + 1, d.getDate())
    const lunar = solar.getLunar()
    const jq = lunar.getJieQi()
    if (jq) {
      map.set(jq, new Date(d))
    }
    d.setDate(d.getDate() + 1)
  }
  return map
}

function getFestivalsForYear(year: number): Festival[] {
  const rawList: Festival[] = []
  
  const jieqiMap = getJieQiMapForYear(year)

  RAW_DATA.forEach((item) => {
    const [ethnic, name, dateStr, desc] = item
    let dateObj: Date | null = null
    let exactJieQiName = ''

    if (name.includes('清明')) exactJieQiName = '清明'
    else if (name.includes('冬至')) exactJieQiName = '冬至'
    else if (JIEQI_LIST.includes(name)) exactJieQiName = name

    if (exactJieQiName && jieqiMap.has(exactJieQiName)) {
      dateObj = new Date(jieqiMap.get(exactJieQiName)!)
    } 
    else if (dateStr.includes('公历')) {
      const match = dateStr.match(/(\d+)月(\d+)日/)
      if (match) {
        dateObj = new Date(year, parseInt(match[1], 10) - 1, parseInt(match[2], 10))
      }
    } else if (dateStr.includes('农历')) {
      const lunarDate = parseChineseDateStr(dateStr)
      if (lunarDate) {
        try {
          const l1 = Lunar.fromYmd(year, lunarDate.m, lunarDate.d)
          const s1 = l1.getSolar()
          if (s1.getYear() === year) {
            rawList.push(createFestivalObj(s1, ethnic, name, desc, dateStr))
          }

          const l2 = Lunar.fromYmd(year - 1, lunarDate.m, lunarDate.d)
          const s2 = l2.getSolar()
          if (s2.getYear() === year) {
            rawList.push(createFestivalObj(s2, ethnic, name, desc, dateStr))
          }
          return
        } catch (e) {
        }
      }
    }

    if (dateObj) {
      const displayOriginalDate = exactJieQiName 
        ? `二十四节气：${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日` 
        : dateStr

      rawList.push({
        date: dateObj,
        ethnic,
        name,
        desc,
        originalDate: displayOriginalDate,
        id: Math.random().toString(36).substr(2, 9),
        isSolarTerm: !!exactJieQiName
      })
    }
  })

  const mergedMap = new Map<string, Festival>()

  rawList.forEach((item) => {
    const dateKey = `${item.date.getFullYear()}-${item.date.getMonth()}-${item.date.getDate()}`
    const uniqueKey = `${dateKey}_${item.name}`

    if (mergedMap.has(uniqueKey)) {
      const existing = mergedMap.get(uniqueKey)!

      if (!existing.ethnic.includes(item.ethnic)) {
        existing.ethnic += `、${item.ethnic}`
      }

      if (!existing.isMerged) {
        const oldEthnic = existing.originalEthnic || existing.ethnic.split('、')[0]
        existing.mergedList = [{ ethnic: oldEthnic, desc: existing.desc }]
        existing.isMerged = true
      }

      existing.mergedList!.push({ ethnic: item.ethnic, desc: item.desc })
    } else {
      item.originalEthnic = item.ethnic
      mergedMap.set(uniqueKey, item)
    }
  })

  return Array.from(mergedMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
}

const currentYear = ref(2026)
const currentMonth = ref(1)
const allFestivals = ref<Festival[]>([])
const selectedFestival = ref<Festival | null>(null)
const activeDay = ref<number | null>(null)

const weeks = ['日', '一', '二', '三', '四', '五', '六']

const monthFestivals = computed(() =>
  allFestivals.value.filter(
    (f) =>
      f.date.getFullYear() === currentYear.value && f.date.getMonth() === currentMonth.value
  )
)

const daysInMonth = computed(
  () => new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
)

const startDay = computed(
  () => new Date(currentYear.value, currentMonth.value, 1).getDay()
)

const calendarCells = computed(() => {
  const cells: { day?: number; festivals: Festival[] }[] = []

  for (let i = 0; i < startDay.value; i++) {
    cells.push({ festivals: [] })
  }

  for (let d = 1; d <= daysInMonth.value; d++) {
    const fds = monthFestivals.value.filter((f) => f.date.getDate() === d)
    cells.push({ day: d, festivals: fds })
  }

  return cells
})

function isFestivalSolarTerm(f: Festival): boolean {
  return !!f.isSolarTerm
}

const selectedFestivalEthnics = computed(() => {
  if (!selectedFestival.value) return []
  if (selectedFestival.value.isSolarTerm) {
    return ['多民族共庆']
  }
  return selectedFestival.value.ethnic.split('、')
})

function refreshFestivals() {
  allFestivals.value = getFestivalsForYear(currentYear.value)
}

function changeMonth(delta: number) {
  let month = currentMonth.value + delta
  let year = currentYear.value

  if (month > 11) {
    month = 0
    year++
  } else if (month < 0) {
    month = 11
    year--
  }

  currentYear.value = year
  currentMonth.value = month
  refreshFestivals()

  selectedFestival.value = null
  activeDay.value = null
}

function selectFestival(f: Festival) {
  selectedFestival.value = f
  activeDay.value = f.date.getDate()

  // #ifdef MP-WEIXIN || H5
  uni.pageScrollTo({
    selector: '#detailContainer',
    duration: 300
  })
  // #endif
}

function onDayTap(cell: { day?: number; festivals: Festival[] }) {
  if (!cell.day || !cell.festivals.length) return
  selectFestival(cell.festivals[0])
}

function onFestivalChipTap(f: Festival) {
  selectFestival(f)
}

onMounted(() => {
  refreshFestivals()

  const demo = allFestivals.value.find(
    (f) =>
      f.name === '春节' &&
      f.date.getFullYear() === 2026 &&
      f.date.getMonth() === 1 &&
      f.date.getDate() === 17
  )
  if (demo) {
    currentYear.value = 2026
    currentMonth.value = 1
    selectFestival(demo)
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 20rpx 16rpx 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  background: radial-gradient(circle at top, #ffe1d4 0, rgba(255, 225, 212, 0.6) 22%, transparent 55%),
    linear-gradient(180deg, #fdf7f0 0, #fef8f2 40%, #fdf7f0 100%);
  color: #2c1810;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 8rpx;
  position: relative;
  padding-top: 4rpx;
}

.page-header::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 320rpx;
  height: 12rpx;
  border-radius: 999px;
  background: linear-gradient(90deg, #c41e3a, #f3b343);
  opacity: 0.75;
}

.page-title-row {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 28rpx;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 183, 146, 0.6);
  margin-bottom: 20rpx;
  font-size: 24rpx;
  color: #8c1229;
  box-shadow: 0 8rpx 24rpx rgba(196, 30, 58, 0.12);
}

.page-title-row .icon {
  font-size: 28rpx;
}

.page-title {
  font-size: 34rpx;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-bottom: 4rpx;
  display: block;
}

.page-subtitle {
  font-size: 26rpx;
  color: #7a665b;
}

.content {
  display: flex;
  flex-direction: row;
  gap: 22rpx;
  margin-top: 20rpx;
}

@media screen and (max-width: 750px) {
  .content {
    flex-direction: column;
  }
}

.panel {
  flex: 11;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 36rpx;
  box-shadow: 0 20rpx 70rpx rgba(0, 0, 0, 0.06);
  padding: 32rpx 32rpx 36rpx;
  border: 1px solid rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: hidden;
}

.panel::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at -10% -10%, rgba(243, 179, 67, 0.25), transparent 55%),
    radial-gradient(circle at 110% 110%, rgba(196, 30, 58, 0.12), transparent 60%);
  opacity: 0.75;
  pointer-events: none;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.panel-title {
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 16rpx;
  color: #8c1229;
}

.panel-title-pill {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 999px;
  background: rgba(255, 244, 236, 0.98);
  border: 1px solid rgba(234, 216, 196, 0.9);
  color: #7a665b;
}

.panel-desc {
  font-size: 24rpx;
  color: #7a665b;
  line-height: 1.6;
  margin-bottom: 16rpx;
  display: block;
}

.month-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 249, 244, 0.98);
  border-radius: 999px;
  padding: 8rpx 20rpx;
  margin-bottom: 24rpx;
  border: 1px solid rgba(234, 216, 196, 0.9);
  font-size: 26rpx;
  color: #7a665b;
}

.month-main {
  font-weight: 600;
  color: #8c1229;
  min-width: 200rpx;
  text-align: center;
}

.month-arrow-btn {
  width: 52rpx;
  height: 52rpx;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #7a665b;
  transition: all 0.2s;
}

.month-arrow-btn:active {
  background: rgba(250, 219, 200, 0.9);
  color: #8c1229;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  column-gap: 12rpx;
  row-gap: 12rpx;
  margin-bottom: 16rpx;
  font-size: 22rpx;
}

.calendar-header-cell {
  text-align: center;
  padding: 8rpx 0 12rpx;
  color: #7a665b;
  font-weight: 600;
  font-size: 24rpx;
}

.calendar-cell {
  position: relative;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7a665b;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid transparent;
  padding: 20rpx 0;
  font-size: 26rpx;
}

.calendar-cell.empty {
  background: transparent;
  border-color: transparent;
}

.calendar-cell.has-festival {
  background: #fff0f1;
  border-color: rgba(196, 30, 58, 0.18);
  color: #8c1229;
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(196, 30, 58, 0.08);
}

.calendar-cell.has-festival::after {
  content: '';
  position: absolute;
  bottom: 8rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #f3b343;
}

.calendar-cell.has-solar-term {
  background: #e8f5e9;
  border-color: rgba(56, 142, 60, 0.25);
  color: #1b5e20;
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.12);
}

.calendar-cell.has-solar-term::after {
  content: '';
  position: absolute;
  bottom: 8rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #4caf50;
}

.calendar-cell.active {
  background: linear-gradient(135deg, #c41e3a, #f3b343);
  color: #fff;
  box-shadow: 0 12rpx 28rpx rgba(196, 30, 58, 0.35);
  border: none;
}

.calendar-cell.active::after {
  background: #fff;
}

.calendar-cell.has-solar-term.active {
  background: linear-gradient(135deg, #2e7d32, #66bb6a);
  box-shadow: 0 12rpx 28rpx rgba(76, 175, 80, 0.35);
}

.panel-hint {
  margin-top: 16rpx;
  font-size: 22rpx;
  text-align: center;
  color: #7a665b;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.panel-hint-badge {
  font-size: 22rpx;
  padding: 2rpx 12rpx;
  border-radius: 999px;
  border: 1px solid rgba(234, 216, 196, 0.9);
  background: rgba(255, 255, 255, 0.9);
}

.panel-hint-legends {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.panel-hint-legend {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: #7a665b;
}

.legend-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}

.legend-dot-festival {
  background: #f3b343;
}

.legend-dot-solar {
  background: #4caf50;
}

.festival-list {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px dashed rgba(216, 190, 163, 0.85);
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.festival-chip {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx 20rpx;
  border-radius: 999px;
  background: #fff7ee;
  color: #7a665b;
  font-size: 24rpx;
  border: 1px solid rgba(234, 216, 196, 0.9);
}

.festival-chip-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #c41e3a;
}

.chip-dot-solar {
  background: #4caf50;
}

.festival-chip.festival-chip-solar {
  background: #e8f5e9;
  border-color: rgba(76, 175, 80, 0.3);
  color: #1b5e20;
}

.festival-chip.festival-chip-solar .festival-chip-dot {
  background: #4caf50;
}

.festival-chip:active {
  background: #fff2e8;
}

.festival-chip.festival-chip-solar:active {
  background: #c8e6c9;
}

.festival-chip.active {
  background: linear-gradient(135deg, #fff0f1, #fff7dd);
  border-color: #c41e3a;
  color: #8c1229;
  font-weight: 500;
  box-shadow: 0 12rpx 28rpx rgba(196, 30, 58, 0.25);
}

.festival-chip.festival-chip-solar.active {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border-color: #4caf50;
  color: #1b5e20;
  box-shadow: 0 12rpx 28rpx rgba(76, 175, 80, 0.25);
}

.detail-panel {
  flex: 15;
}

.detail-inner {
  border-radius: 32rpx;
  background: radial-gradient(circle at 0% 0%, rgba(243, 179, 67, 0.22), transparent 55%),
    radial-gradient(circle at 120% 110%, rgba(196, 30, 58, 0.2), transparent 60%),
    linear-gradient(145deg, rgba(255, 244, 235, 0.96), rgba(255, 255, 255, 0.96));
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.06);
  padding: 24rpx 24rpx 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.detail-inner::after {
  content: '';
  position: absolute;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  border: 1px dashed rgba(255, 255, 255, 0.7);
  right: -100rpx;
  bottom: -80rpx;
  pointer-events: none;
}

.detail-inner.detail-inner-solar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 0% 0%, rgba(76, 175, 80, 0.12), transparent 50%);
  pointer-events: none;
}

.detail-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  align-items: center;
}

.detail-tag-label {
  font-size: 24rpx;
  color: #7a665b;
}

.detail-tag {
  font-size: 24rpx;
  padding: 6rpx 18rpx;
  border-radius: 999px;
  background: rgba(255, 237, 220, 0.94);
  color: #8c1229;
  border: 1px solid rgba(234, 216, 196, 0.95);
}

.detail-festival-name {
  font-size: 30rpx;
  font-weight: 700;
  margin-top: 10rpx;
  color: #8c1229;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx;
}

.detail-festival-name .icon {
  font-size: 32rpx;
}

.detail-badge-solar {
  font-size: 20rpx;
  padding: 4rpx 16rpx;
  border-radius: 999px;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: #fff;
  font-weight: 500;
}

.detail-tag.detail-tag-solar {
  background: rgba(232, 245, 233, 0.94);
  color: #1b5e20;
  border-color: rgba(76, 175, 80, 0.4);
}

.detail-meta-row {
  font-size: 24rpx;
  color: #7a665b;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 32rpx;
  margin-top: 4rpx;
  margin-bottom: 12rpx;
  padding-bottom: 12rpx;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}

.detail-meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.detail-meta-label {
  font-weight: 600;
}

/* 优化：去除固定的最大高度限制，让白框自适应文字长度，完美包裹 */
.detail-body {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #2c1810;
  border: 1px dashed rgba(226, 200, 170, 0.9);
  width: 100%;
  box-sizing: border-box;
}

.detail-desc-seg + .detail-desc-seg {
  margin-top: 12rpx;
}

.detail-desc-ethnic {
  font-weight: 600;
  color: #8c1229;
}

.detail-desc-text {
  color: #2c1810;
}

.detail-footer {
  margin-top: 8rpx;
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  flex-wrap: wrap;
  align-items: center;
  font-size: 22rpx;
  color: #7a665b;
}

.detail-footer-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.detail-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #f3b343;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  text-align: center;
  color: #7a665b;
}

.empty-state-icon {
  font-size: 60rpx;
  margin-bottom: 8rpx;
}

.empty-state-title {
  font-size: 30rpx;
  margin-bottom: 4rpx;
}

.empty-state-desc {
  font-size: 24rpx;
  line-height: 1.5;
  padding: 0 40rpx;
}

@media screen and (max-width: 750px) {
  .page {
    padding: 24rpx 20rpx 40rpx;
    padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
    min-height: 100vh;
  }

  .content {
    gap: 24rpx;
  }

  .panel {
    padding: 24rpx 20rpx 24rpx;
  }

  .month-arrow-btn {
    min-width: 64rpx;
    min-height: 64rpx;
  }

  .calendar-cell {
    padding: 12rpx 0;
    min-height: 64rpx;
  }

  .festival-chip {
    padding: 10rpx 24rpx;
    min-height: auto;
  }

  .detail-inner {
    padding: 20rpx;
    min-height: auto;
  }

  /* 优化：移动端白框更加紧凑，同时不限制高度 */
  .detail-body {
    padding: 20rpx;
  }

  .festival-list {
    gap: 16rpx;
  }

  .panel-hint-legends {
    gap: 24rpx;
  }
}

@media screen and (max-width: 500px) {
  .page-title {
    font-size: 30rpx;
  }

  .calendar-grid {
    column-gap: 8rpx;
    row-gap: 8rpx;
  }

  .calendar-cell {
    font-size: 24rpx;
    padding: 14rpx 0;
    min-height: 64rpx;
  }
}
</style>