using System;

namespace SharedCode
{
	public class FakeHardware : IExperimentHardware
	{
		DataSet data;
		ExperimentParameters parameters;

		object updateDataLock = new object();

		public FakeHardware ()
		{
		}

		public void Initialise(ExperimentParameters p)
		{
			parameters = p;
			data = new DataSet ();	
		}
		public DataSet Run()
		{
			Random rnd = new Random();
			lock (updateDataLock)
			{
				for (int i = 0; i < parameters.NumberOfPoints; i++) {
					data.Add (new DataPoint (i, rnd.Next (-1, 1)));
				}
			}
			return data;
		}
		public void Dispose()
		{
			
		}

	}
}

