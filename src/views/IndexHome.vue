<template>
  <div id="main" class="main">
    <h1>🐱‍🚀🔥杰杰英语特训营🔥🐱‍🚀</h1>
    <div class="block">
      <el-container style="height: 500px; border: 1px solid #eee;">
        <el-aside style="background-color: rgb(238, 241, 246);  width: 30%">
          <el-select v-model="value" placeholder="选择单词组..." style="margin-top: 25px" @change="changeGroup">
            <el-option
                v-for="item in groups"
                :key="item.value"
                :label="item.label.groupName"
                :value="{label:item.label,value:item.value}">
            </el-option>
          </el-select>
        </el-aside>

        <el-container>

          <el-main>
            <el-form :model="form" ref="form" class="demo-form-inline" @submit.native.prevent>
              <el-form-item label="抽多少个？" label-width="50%" style="text-align: left; margin-right: 25%">
                <el-input-number v-model="form.num" :min="5" :step="5" step-strictly></el-input-number>
              </el-form-item>
              <el-form-item label="范围" label-width="25%" style="text-align: left; margin-right: 25%">
                <el-slider
                    v-model="form.range"
                    range
                    show-stops
                    :step="20"
                    style="width: 100%"
                    :max="maxRange">
                </el-slider>
              </el-form-item>
              <el-form-item >
                <el-button type="primary" @click="onSubmit">开始！</el-button>
              </el-form-item>
            </el-form>
          </el-main>
        </el-container>
      </el-container>
      <!-- Form -->
      <el-dialog title="开始测试" :visible="true" v-if="answer.words.length > 0" :showClose="false">
        进度：{{answer.answers.length + 1}} / {{answer.count}}<el-progress :percentage="answer.progress" :show-text="false"></el-progress>
        正确：<el-progress :percentage="answer.accuracyRate"  status="success"></el-progress>
        <el-form @submit.native.prevent>
          <el-form-item label="">
            <h2>{{answer.currentWord}} </h2><el-input v-model="answer.currentAnswer" autocomplete="off"  @keydown.enter.native="confirmAnswer"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="danger" @click="cancelTest">取 消</el-button>
          <el-button type="primary" @click="confirmAnswer" @submit="confirmAnswer">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog title="答题结果" :visible.sync="resultDialog" :lock-scroll="false" style="height: 800px">
        <el-table :data="answer.answers">
          <el-table-column property="id" label="序号" width="55px"/>
          <el-table-column property="word" label="单词" width="80px" :show-overflow-tooltip="true"/>
          <el-table-column property="translation" label="翻译" :show-overflow-tooltip="true"/>
          <el-table-column property="answerWord" label="回答" width="75px" :show-overflow-tooltip="true"/>
          <el-table-column property="result" label="结果">
            <template scope="scope">
              <span v-if="scope.row.result">
              ✔️
            </span>
              <span v-else>❌</span>
            </template>
          </el-table-column>
        </el-table>
          <div>
            <span> 总题数：{{answer.count}} 个；正确：{{answer.correct}} 个；正确率为：{{answer.accuracyRate}} % </span>
          </div>
      </el-dialog>
    </div>
    <router-view/>
  </div>
</template>
<script lang="ts">
export default{
  name: "IndexHome",
  mounted (){
    this.listGroup()
  },
  data() {
    return {
      value: null,
      maxRange: 0,
      groups: [],
      form: {
        num: '',
        range:[0,0],
        groupId: null,
        startAt: 0,
        endAt: 0
      },
      answer: {
        words: [],
        count: null,
        currentWord: null,
        currentAnswer: null,
        correct: 0,
        answers: [],
        // 正确率
        accuracyRate: 0,
        // 进度
        progress: 0
      },
      resultDialog: false
    }
  },
  methods: {
    async listGroup() {
      const _this = this
      const result = await this.$axios({
        url: '/word/listGroup',
        method: 'get',
      });

      if (result.code === 0 && result.data) {
        result.data.forEach(function(it) {
          const option = {value: it.id, label: it}
          _this.groups.push(option)
        })
      } else {
        _this.$message.error(result.data.errMsg)
      }
    },
    async onSubmit() {
      this.answer = {
        words: [],
        count: null,
        currentWord: null,
        currentAnswer: null,
        correct: 0,
        answers: [],
        // 正确率
        accuracyRate: 0,
        // 进度
        progress: 0
      }
      const _this = this
      let form = this.form
      if (!form.range || form.range[0] < 0 || form.range[1] <= 0) {
        this.$message.warning("请选择范围")
      } else {
        form.startAt = form.range[0]
        form.endAt = form.range[1]
        const result = await this.$axios({
          url: '/word/checkWords',
          method: 'get',
          params: {
            endAt: form.endAt,
            groupId: form.groupId,
            num: form.num,
            startAt: form.startAt
          }
        })
        if (result.code === 0 && result.data) {
          _this.initWords()
          _this.answer.count = result.data.length
          _this.answer.currentWord = result.data[0].word
          result.data.forEach(function(it) {
            _this.answer.words.push(it)
          })
        } else {
          _this.$message.error(result.data.errMsg)
        }
      }
    },
    changeGroup(group) {
      this.maxRange = group.label.wordsCount
      this.form.groupId = group.label.id
    },
    initWords() {
      this.answer.words = []
      this.answer.answers = []
      this.correct = 0
    },
    cancelTest() {
      const _this = this
      this.$confirm("是否取消测试","提示",{
        iconClass: "el-icon-question",
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        showClose: true,
        type: "warning",
      }).then(function(){
        _this.initWords()
        _this.$message.success("取消成功")
      })
    },
    // 提交答案
    confirmAnswer() {
      //包含中文正则
      var cnPattern = /[^\u4e00-\u9fa5|,]+/g;
      if (this.answer.currentAnswer) {
        const answer = this.answer.currentAnswer.toString().replaceAll(cnPattern, '')
        if (!answer || answer === '') {
          this.$message.error('请输入答案！')
        } else {
          const result = this.answer.words[0].translation.toString().includes(answer)
          if (result) {
            this.$message({
              dangerouslyUseHTMLString: true,
              message: this.answer.words[0].word + '<br/>回答正确，正确答案：' + this.answer.words[0].translation + '<br/>你的答案：' + this.answer.currentAnswer,
              type: 'success',
              duration: 5000
            })
            this.answer.correct++

          } else {
            this.$message({
              dangerouslyUseHTMLString: true,
              message: this.answer.words[0].word + '<br/>回答错误，正确答案：' + this.answer.words[0].translation + '<br/>你的答案：' + this.answer.currentAnswer,
              type: 'error',
              duration: 5000
            })
          }
          // 切换到下一个词
          this.nextWord(result)
        }
      }
    },
    nextWord(result) {
      // 切换到下一个词
      const currentWord = this.answer.words.shift()
      // 记录答题结果
      currentWord.result = result
      // 记录答案
      currentWord.answerWord = this.answer.currentAnswer
      this.answer.answers.push(currentWord)
      if (this.answer.words.length > 0) {
        this.answer.currentWord = this.answer.words[0].word
      } else {
        // 答题结束
        this.answer.currentWord = null
        this.resultDialog = true
      }
      // 清空当前回答
      this.answer.currentAnswer = null
      this.answer.accuracyRate = (this.answer.correct / this.answer.count).toFixed(2) * 100
      this.answer.progress = (this.answer.answers.length / this.answer.count).toFixed(2) * 100
    }
  }
}
</script>

<style>
.main{
  width: 100%;
  margin: 120px auto;
  text-align: center;
}
.block{

}

.el-dialog{
  width: 24rem !important;
  top: 5rem;
  text-align: center !important;
}
</style>
