**需求：**  
1.基于谷歌小恐龙游戏  
2.主题是公主闯关救骑士  
3.彩色的  
4.越过仙人掌和翼手龙  
5.路上会随机捡到雪碧、海苔、元旦、元宵、滚滚，每遇到一只会变装  
6.遇到恶龙boss，触发大招，展示一段动画：临兵斗者 皆列阵前行  
7.恶龙boss变小，跳过  
8.动画展示走向受伤的骑士  
9.弹出钻戒图片：marry me！  


**逻辑：**  
1.页面加载完就实例一个Runner  
2.初始化Runner参数后，加载地图loadImages  
3.根据设备获取不同清晰度的精灵图，获取对应的物品坐标，然后初始化init一个Runner  
4.创建一个canvas画布，然后实例化地平线和背景、测距仪、恐龙。  
5.开始监听用户动作事件startListening，准备开始游戏。还要Runner.update一下。  
6.通过事件钩子handleEvent，监听键盘/触摸屏/鼠标事件onKeyDown控制小恐龙的动作（跳/蹲）  
7.Horizon类的实例化，包含了地平线、背景云朵、障碍物。  
8.地平线Horizon的init，只需添加线和云。没有障碍。  
9.云的逻辑：init、draw、update、isVisible。  
10.地平线的逻辑：setSourceDimensions、getRandomType、draw、updateXPos、update、reset。  
11.夜间模式的逻辑：暂时不管