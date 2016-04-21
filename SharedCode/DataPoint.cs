using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace SharedCode
{
    public class DataPoint
    {
        public List<KeyValuePair<string, double>> kvPairs;

        public DataPoint(string[] names, double[] vals)
        {
            kvPairs = new List<KeyValuePair<string, double>>();
            for (int i = 0; i < names.Length; i++)
            {
                kvPairs.Add(new KeyValuePair<string, double>(names[i], vals[i]));
            }
        }

        public int Dimensions()
        {
            return kvPairs.Count;
        }

        public string ToJson()
        {
            string jsonPairs = "";
            for(int i = 0; i < Dimensions(); i++)
            {
                jsonPairs += "\"" + kvPairs[i].Key.ToString() + "\"" + " : " + kvPairs[i].Value.ToString() ;
                if(i < Dimensions() - 1)
                {
                    jsonPairs += ", ";
                }
            }
            jsonPairs = "{" + jsonPairs + "}";
            return jsonPairs;
        }
    }

}