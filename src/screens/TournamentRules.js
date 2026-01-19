import React from 'react'
import {useNavigate} from 'react-router-dom'
import Constants from '../Constants'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import find from 'lodash/find'

import Styles from './styles/TournamentRules.module.css'

const TournamentRules = () => {
    const navigate = useNavigate()

    const handleClickBattleplan = (battleplan) => () => {
        navigate('/battleplan', {state: {title:battleplan.title, battleplan}})
    }

    const handlleClickOrgLink = () => {
        navigator.clipboard.writeText('https://vk.com/dicepod')
        toast.success('Ссылка на соц сети организаторов скопирована', Constants.toastParams)
    }

    const handleClickAppendix = (index, title) => () => {
        navigate('/appendixRules', {state: {title, index}})
    }

    const renderBattleplan = (battleplan) =>
        <button key={battleplan?.id} id={Styles.battleplan} onClick={handleClickBattleplan(battleplan)}>{battleplan?.title}</button>

    const renderTable = () => <table>
        <thead>
            <tr>
            <th>31 января</th>
            <th>Событие</th>
            <th>Миссии</th>
            </tr>
        </thead>
        <tbody>
            <tr>
            <td>9:00 – 10:00</td>
            <td colspan="2">Регистрация</td>
            </tr>
            <tr>
            <td>10:00 – 10:30</td>
            <td colspan="2">Паринги</td>
            </tr>
            <tr>
            <td rowspan="3">10:30 – 13:30</td>
            <td rowspan="3">Первый тур</td>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Passing Seasons']))}</td>
            </tr>
            <tr>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Roiling Roots']))}</td>
            </tr>
            <tr>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Cyclic Shifts']))}</td>
            </tr>
            <tr>
            <td>14:30 – 15:00</td>
            <td colspan="2">Паринги</td>
            </tr>
            <tr>
            <td rowspan="3">15:00 – 18:00</td>
            <td rowspan="3">Второй тур</td>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Surge of Slaughter']))}</td>
            </tr>
            <tr>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Linked Ley Lines']))}</td>
            </tr>
            <tr>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Noxious Nexus']))}</td>
            </tr>
            <tr>
            <td colspan="3" class="center bold">1 февраля</td>
            </tr>
            <tr>
            <td>10:00 – 10:30</td>
            <td colspan="2">Паринги</td>
            </tr>
            <tr>
            <td rowspan="3">10:30 – 13:30</td>
            <td rowspan="3">Третий тур</td>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'The Liferoots']))}</td>
            </tr>
            <tr>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Bountiful Equinox']))}</td>
            </tr>
            <tr>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Lifecycle']))}</td>
            </tr>
            <tr>
            <td>14:30 – 15:00</td>
            <td colspan="2">Паринги</td>
            </tr>
            <tr>
            <td rowspan="3">15:00 – 18:00</td>
            <td rowspan="3">Четвертый тур</td>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Creeping Corruption']))}</td>
            </tr>
            <tr>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Grasp of Thorns']))}</td>
            </tr>
            <tr>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Linked Ley Lines']))}</td>
            </tr>
            <tr>
            <td>18:30</td>
            <td colspan="2">Награждение</td>
            </tr>
        </tbody>
    </table>

    return <div id='column' className='Chapter'>
        <p id={Styles.text}>Дата проведения: 31 января - 1 февраля 2026</p>
        <p id={Styles.text}>Адрес проведения: Россия, Москва, Андропова пр-т, 8, Москва, ТЦ Мегаполис, 3 этаж, клуб ”Dicepod”</p>
        <p id={Styles.text}>Резервные контакты для связи с оргкомитетом: <p id={Styles.orgLink} onClick={handlleClickOrgLink}>https://vk.com/dicepod</p></p>
        <p id={Styles.text}><b>Расписание турнира</b></p>
        {renderTable()}
        <p id={Styles.text}><b>Общая информация:</b></p>
        <p id={Styles.text}>Турнир проходит в четыре раунда по швейцарской системе. На тур отводится 3.5 часа. 30 минут на составление парингов, 3 часа на игру. Использование таймера/часов обязательно. Дополнительного времени для завершения партии предоставляться не будет. Если требуется дополнительное время для разрешения исхода партии - обратится к организаторам за 15 минут до конца времени отведенного на тур. В противном случае вносится текущий на момент завершения тура результат партии.</p>
        <p id={Styles.text}>Призовые места - первое, второе, третье место, последнее место.</p>
        <p id={Styles.text}>Формат: 2000 очков Battlepack из General Handbook 2025 и актуальный на дату проведения мероприятия FAQ</p>
        <p id={Styles.text}><b>Ограничения для команды:</b></p>
        <p id={Styles.text}>В команде НЕЛЬЗЯ повторять фракции между игроками</p>
        <p id={Styles.text}>Army of Renown, а также Kruleboyz и Ironjaws считаются отдельными фракциями;</p>
        <p id={Styles.text}>Нельзя повторять варскроллы и именных персонажей, доступных нескольким фракциям (Крагнос, Нагаш) между армиями (внутри одной армии - согласно общим правилам)</p>
        <p id={Styles.text}>Нельзя повторять Manifestation Lore между армиями</p>
        <p id={Styles.text}>Нельзя повторять Regiment Of Renown между армиями</p>
        <p id={Styles.text}>Тактики внутри команды повторять можно не более трех раз</p>
        <p id={Styles.text}><b>Формирование пар игроков</b></p>
        <p id={Styles.text}>Шаг 1. Каждая команда назначает одну армию защитником, затем команды одновременно сообщают свои решения друг к другу</p>
        <p id={Styles.text}>Шаг 2. Каждая команда назначает две свои армии нападающими, затем команды одновременно сообщают свои решения друг к другу</p>
        <p id={Styles.text}>Шаг 3. Каждая команда выбирает, с кем из двух нападающих будет играть её защитник, затем команды одновременно сообщают свои решения друг к другу. Так определяется первые две пары игроков</p>
        <p id={Styles.text}>Шаг 4. Каждая команда назначает одну из оставшихся армий очередным защитником, затем команды одновременно сообщают решения друг к другу</p>
        <p id={Styles.text}>Шаг 5. Каждая команда назначает две из оставшихся армий нападающими, затем команды одновременно сообщают свои решения друг к другу</p>
        <p id={Styles.text}>Шаг 6. Каждая команда выбирает, с кем из двух нападающих будет играть её защитник, затем команды одновременно сообщают свои решения друг к другу. Так определяется третья и четвертая пары игроков</p>
        <p id={Styles.text}>Шаг 7. Теперь отвергнутые на шестом шаге нападающие играют против тех игроков, которые не были задействованы во время шагов 4-6. Так определяются пятая и шестая пары игроков</p>
        <p id={Styles.text}>Первые две пары игроков будут играть на первой миссии тура, третья и четвертая пары — на второй, пятая и шестая пары — на третьей</p>
        <p id={Styles.text}></p>
        <p id={Styles.text}>Распределение столов осуществляют капитаны команд</p>
        <p id={Styles.text}>Для парингов каждая команда должна подготовить карточки, жетоны, или прочие приспособления отображающие игрока команды и его армию. Карточки для парингов, либо др. приспособления должны быть читаемы и понятн</p>
        <p id={Styles.text}><b>Подсчет очков и определение победителя</b></p>
        <p id={Styles.text}>За партию можно получить до 20 турнирных очков, которые определяются в зависимости от разницы в победных очках между победителем и проигравшим</p>
        <table>
            <tr>
                <th>Разница в победных очках</th>
                <th>Турнирные очки победителя</th>
                <th>Турнирные очки проигравшего</th>
            </tr>
            <tr><td>0 и поровну тактик</td><td>10</td><td>10</td></tr>
            <tr><td>0 + больше тактик</td><td>11</td><td>9</td></tr>
            <tr><td>1-5</td><td>12</td><td>8</td></tr>
            <tr><td>6-10</td><td>13</td><td>7</td></tr>
            <tr><td>11-15</td><td>14</td><td>6</td></tr>
            <tr><td>16-20</td><td>15</td><td>5</td></tr>
            <tr><td>21-25</td><td>16</td><td>4</td></tr>
            <tr><td>26-30</td><td>17</td><td>3</td></tr>
            <tr><td>31-35</td><td>18</td><td>2</td></tr>
            <tr><td>36-40</td><td>19</td><td>1</td></tr>
            <tr><td>41+</td><td>20</td><td>0</td></tr>
        </table>
        <p id={Styles.text}>Таким образом, теоретически в каждом раунде команда может получить от 0 до 120 очков. Однако, чтобы ограничить эффект особенно разгромных побед, на этом турнире устанавливаются верхняя и нижняя границы очков за раунд (так называемый, кап очков). Верхняя граница составляет 90 очков, а нижняя 30 очков</p>
        <p id={Styles.text}>Например, если команда «Зеленый грот» разгромила команду «Черный дракон» со счетом 116-4, то в «Зеленый грот» получит всего 90 турнирных очков, а «Черный дракон» — целых 30 очков</p>
        <p id={Styles.text}>Победу в турнире одержит команда с наибольшим количеством побед. В случае равенства этого показателя более высокое место займет команда с максимальной суммой очков. А если и эта сумма окажется равной, то предпочтение будет отдано команде, имеющей более высокую силу расписания: суммарное количество турнирных очков противников данной команды (с учетом капа)</p>
        <p id={Styles.text}></p>
        <p id={Styles.text}>Дополнительные пункты</p>
        <p id={Styles.text}>В случае опоздания одного из игроков, второй игрок имеет право включить таймер, время которого будем вычтено из игрового времени опоздавшего</p>
        <p id={Styles.text}>В случае опоздания оппонента более чем на час, второй игрок автоматически получает 20 ТО</p>
        <p id={Styles.text}>В случае неявки оппонента второй игрок получает 20 ТО</p>
        <p id={Styles.text}>Организаторы оставляют за собой право удалить участника с мероприятия при неадекватном и/или конфликтном поведении</p>
        <p id={Styles.text}>При любом проявлении неспортивного поведения организаторы оставляют за собой право оштрафовать команду или удалить игрока с турнира</p>
        <button id={Styles.button} onClick={handleClickAppendix(1, 'Правила использования шахматных часов')}>Приложение 1</button>
        <button id={Styles.button} onClick={handleClickAppendix(2, 'Система желтых карточек')}>Приложение 2</button>
        <button id={Styles.button} onClick={handleClickAppendix(3, 'Этика скорости')}>Приложение 3</button>
        <ToastContainer />
    </div>
}

export default TournamentRules