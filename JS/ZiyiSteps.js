const maxRetries = 3; // 最大重试次数
let runCount = 0; // 运行次数计数器

function updateSteps(retries = 0) {
  runCount++; // 增加运行次数计数器

  console.log(`正在运行第 ${runCount} 次`);

  const savedData = $persistentStore.read('Ziyi');
  if (savedData) {
    const [savedAccount, savedPassword, savedMaxSteps, savedMinSteps, notifyOption] = savedData.split('@');
    if (savedAccount && savedPassword && savedMaxSteps && savedMinSteps && notifyOption) {
      account = savedAccount;
      password = savedPassword;
      maxSteps = parseInt(savedMaxSteps);
      minSteps = parseInt(savedMinSteps);
      notify = notifyOption === 'M';
    }
  }

  // 判断账号密码最大步数最小步数是否存在
  if (!account) {
    console.log('缺少账号信息');
    if (notify) {
      $notification.post('步数更改失败', '缺少账号信息', '请检查账号');
    }
    $done();
  }
  if (!password) {
    console.log('缺少密码信息');
    if (notify) {
      $notification.post('步数更改失败', '缺少密码信息', '请检查密码');
    }
    $done();
  }
  if (!maxSteps) {
    console.log('缺少最大步数信息');
    if (notify) {
      $notification.post('步数更改失败', '缺少最大步数信息', '请检查最大步数');
    }
    $done();
  }
  if (!minSteps) {
    console.log('缺少最小步数信息');
    if (notify) {
      $notification.post('步数更改失败', '缺少最小步数信息', '请检查最小步数');
    }
    $done();
  }

  // 判断最大步数和最小步数是否超限
  if (maxSteps > 98000 || minSteps > 98000) {
    console.log('最大步数和最小步数不能超过98000');
    if (notify) {
      $notification.post('步数更改失败', '最大步数和最小步数不能超过98000', '请检查最大步数和最小步数');
    }
    $done();
  } else if (maxSteps < minSteps) {
    console.log('最大步数不能小于最小步数');
    if (notify) {
      $notification.post('步数更改失败', '最大步数不能小于最小步数', '请检查最大步数和最小步数');
    }
    $done();
  } else if (minSteps > maxSteps) {
    console.log('最小步数不能大于最大步数');
    if (notify) {
      $notification.post('步数更改失败', '最小步数不能大于最大步数', '请检查最大步数和最小步数');
    }
    $done();
  } else {
    const randomSteps = Math.floor(Math.random() * (maxSteps - minSteps + 1)) + minSteps;

    const url = 'http://bs.svv.ink/index.php';

    const request = {
      url: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      },
      body: `account=${account}&password=${password}&steps=${randomSteps}&max_steps=${maxSteps}&min_steps=${minSteps}`,
    };

    $httpClient.post(request, function (error, response, data) {
      if (error || response.status !== 200) {
        console.log('请求失败：', error || response.status);
        if (notify) {
          $notification.post('步数更改失败', '请求失败', error || response.status);
        }
        // 检查重试次数是否超过最大重试次数
        if (retries < maxRetries) {
          // 在重试之前添加延迟
          setTimeout(() => {
            // 增加重试次数并调用updateSteps函数进行重试
            const nextRetry = retries + 1;
            updateSteps(nextRetry);
          }, 5000); // 在重试之前等待5秒
        } else {
          console.log('重试次数超过最大限制');
          if (notify) {
            $notification.post('步数更改失败', '重试次数超过最大限制', '请稍后再试');
          }
          $done();
        }
      } else {
        const jsonData = JSON.parse(data);
        console.log(`步数更新成功：${randomSteps.toString()}`, jsonData);
        if (notify) {
          $notification.post('步数更新成功', `步数：${randomSteps.toString()}`, '@ZhangZiyi', 'https://t.me/ymyuuu');
        }
        $done();
      }
    });

    const newData = `${account}@${password}@${maxSteps}@${minSteps}@${notify ? 'M' : 'N'}`;
    $persistentStore.write(newData, 'Ziyi').then(() => {
      console.log('写入成功');
    }, () => {
      console.log('写入失败');
    });
  }

  if (runCount === 10) {
    console.log('已运行10次，结束程序');
    return;
  }

  // 在下一次运行前添加延迟
  setTimeout(() => {
    updateSteps(retries);
  }, 5000); // 在下一次运行前等待5秒
}

// 调用函数开始更新步数
updateSteps();

function validateStatus(status) {
  switch (status) {
    case 1:
      return "执行成功";
    case 201:
      return "密码错误";
    case 202:
      return "手机号格式错误";
    case 203:
    case 204:
      return "密码正确，获取token失败";
    default:
      return "未知状态";
  }
}
