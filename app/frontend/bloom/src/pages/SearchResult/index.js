import React, {useState, useCallback} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {useFocusEffect} from '@react-navigation/native';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import ShopCard from '../../components/ShopCard';
import {searchAPI} from '../../utils/Axios';
import {useSelector} from 'react-redux';
import {useDispatch} from 'react-redux';
import shopSlice from '../../redux/slices/shop';

/**
 * CSW, LDJ | 2022.05.13
 * @name SearchResultPage
 * @des
 * # 사용 컴포넌트 : ShopCard
 * # 무한 루프 에러 해결?! [리덕스로~]
 *  */

const SearchResultPage = ({navigation, route}) => {
  const dispatch = useDispatch();
  const search_list = useSelector(state => state.shop.search_list);
  const user_id = useSelector(state => state.user.id);
  const token = useSelector(state => state.user.accessToken);
  const type = route.params.type;
  const user_lat = route.params.user_lat;
  const user_lng = route.params.user_lng;
  const word = route.params.word;
  const [inputText, setInputText] = useState('');

  const getShop = useCallback(async () => {
    try {
      const res = await searchAPI.get(
        type,
        user_id,
        user_lat,
        user_lng,
        word,
        token,
      );
      const search_data = res.data.data;
      if (res.data.result === 'success') {
        dispatch(shopSlice.actions.setSearchList(search_data));
      }
    } catch (error) {
      console.log('검색어 결과 에러 : ', error);
    }
  }, [type, user_id, user_lat, user_lng, word, token, dispatch]);

  const setText = useCallback(() => {
    if (word === 'kw_reasonable') {
      setInputText('#가성비');
    } else if (word === 'kw_clean') {
      setInputText('#깔끔');
    } else if (word === 'kw_mood') {
      setInputText('#감성');
    } else if (word === 'kw_various') {
      setInputText('#다양한구성');
    } else {
      setInputText(word);
    }
  }, [word]);

  const renderItem = useCallback(
    ({item}) => {
      return <ShopCard item={item} navigation={navigation} />;
    },
    [navigation],
  );

  useFocusEffect(
    useCallback(() => {
      setText();
      getShop();
    }, [getShop, setText]),
  );

  return (
    <KeyboardAvoidingView behavior="height" style={{flex: 1}}>
      <View style={styles.container}>
        <View style={styles.searchBox}>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="검색어를 입력하세요."
              value={inputText}
              onChangeText={setInputText}></TextInput>
            <View style={styles.iconBox}>
              <Icon.Button
                onPress={() =>
                  navigation.navigate('Search', {
                    type: 'location',
                    word: `${inputText}`,
                    user_id: user_id,
                    user_lat: 0,
                    user_lng: 0,
                  })
                }
                name="search-outline"
                color="black"
                backgroundColor="transparent"
              />
            </View>
          </View>
        </View>
        <View style={styles.list}>
          <FlatList
            //리스트의 소스를 담는 속성
            data={search_list}
            //data로 받은 소스의 아이템들을 render 시켜주는 콜백함수
            renderItem={renderItem}
            //item의 고유의 키를 부여하는 속성
            keyExtractor={item => item.shop_number}
          />
        </View>
        <View style={styles.mapBtn}>
          <Icon.Button
            name="map-outline"
            color="white"
            backgroundColor="#F2A7B3"
            size={20}
            borderRadius={30}
            width={50}
            alignItems="center"
            justifyContent="center"
            onPress={() =>
              navigation.navigate('Map', {
                page: 'search',
                type: route.params.type,
                word: route.params.word,
                user_id: user_id,
                user_lat: 0,
                user_lng: 0,
              })
            }
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    fontSize: 14,
    marginLeft: 10,
  },
  inputBox: {
    flex: 1,
    borderStyle: 'solid',
    backgroundColor: 'white',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 10,
    borderColor: '#F2A7B3',
    borderWidth: 1.5,
  },
  iconBox: {
    flex: 1,
    position: 'absolute',
    width: '20%',
    top: 5,
    right: 0,
  },
  searchBox: {
    flex: 0.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 250,
    height: 100,
    marginVertical: 15,
  },
  list: {
    flex: 3,
  },
  mapBtn: {
    position: 'absolute',
    right: 15,
    bottom: 10,
    width: '11%',
    height: '10%',
  },
});

export default SearchResultPage;
