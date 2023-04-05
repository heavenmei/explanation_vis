import sys
import os
sys.path.append(os.curdir)

import numpy as np
import pandas as pd 
from utils.parser import *
from utils.helper import *
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder ,normalize,LabelEncoder,StandardScaler
import copy


args = parse_args()
int_col_len = -1

def load_adult_income_dataset():
    # 获取数据集
    datafile=args.data_path + args.dataset+'/final_data.csv'
    adult_data = pd.read_csv(datafile, header = 0)
    adult_data.drop('id',axis=1,inplace = True)
    target = adult_data['income']
    target = np.array(target)
    adult_data ,one_hot_encoder = data_encode_define(adult_data)
    return adult_data,target,one_hot_encoder

def data_encode_define(dataset):
    df_object_col = [col for col in dataset.columns if dataset[col].dtype.name == 'object'] # 3个
    df_int_col = [col for col in dataset.columns if dataset[col].dtype.name != 'object'and col != 'income']
    
    dataset = pd.concat([dataset[df_int_col],dataset[df_object_col]], axis = 1).values
    global int_col_len
    int_col_len = len(df_int_col)
    dataset = Labelencoder(dataset,int_col_len)
    dataset = np.array(dataset, dtype = np.float32)

    one_hot_encoder = OneHotEncoder()
    one_hot_encoder.fit(dataset[:,int_col_len:])

    dataset = np.array(dataset, dtype = np.float32)
    return dataset,one_hot_encoder

def Labelencoder(x_data,int_len):
    dataset = copy.deepcopy(x_data[:,0:int_len])
    encoder = LabelEncoder()

    object_col = x_data[:,int_len:]
    rows,cols = object_col.shape
    for c in range(cols):
        tmp = encoder.fit_transform(object_col[:,c].ravel()).reshape(rows,1)
        dataset = np.concatenate((dataset,tmp),axis = 1)
    return dataset

def encoder_process(x_data,encoder):
    dataset = copy.deepcopy(x_data[:,:int_col_len])
    tmp = encoder.transform(x_data[:,int_col_len:]).toarray()
    dataset = np.concatenate((dataset,tmp),axis = 1)
    dataset = np.array(dataset, dtype = np.float32)
    return dataset


class Adult_data(Dataset) :
    def __init__(self,mode,tensor = True) :
        super(Adult_data, self).__init__()
        self.mode = mode
        x_dataset,target,one_hot_encoder = load_adult_income_dataset()
        x_dataset = encoder_process(x_dataset,one_hot_encoder)
        x_dataset = normalize(x_dataset,axis = 0,norm = 'max')

        # 划分数据集
        train_dataset, test_dataset, y_train, y_test = train_test_split(x_dataset,
                                                                        target,
                                                                        test_size=0.2,
                                                                        random_state=0,
                                                                        stratify=target)
        if tensor:
            if mode == 'train' : 
                self.target = torch.tensor(y_train)
                self.dataset = torch.FloatTensor(train_dataset)
            else :
                self.target = torch.tensor(y_test)
                self.dataset = torch.FloatTensor(test_dataset)
        else:
            if mode == 'train' : 
                self.target = y_train
                self.dataset = train_dataset
            else :
                self.target = y_test
                self.dataset = test_dataset

        print(self.dataset.shape, self.target.dtype)   
        
    def __getitem__(self, item) :
        return self.dataset[item], self.target[item]

    def __len__(self) :
        return len(self.dataset)